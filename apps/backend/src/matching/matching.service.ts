import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { subDays } from 'date-fns';
import axios from 'axios';
import { MatchResult } from './entities/match-result.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Job } from '../jobs/entities/job.entity';
import { Skill } from '../skills/entities/skill.entity';
import {
  StudentSkill,
  NivelSkill,
} from '../skills/entities/student-skill.entity';
import { Modalidad } from '@find-matching-jobs/types';
import { MatchingOptions } from './interfaces/matching-options.interface';
import { MatchesQueryDto } from './dto/matches-query.dto';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  private readonly NIVEL_VALUES: Record<NivelSkill, number> = {
    [NivelSkill.BASICO]: 1,
    [NivelSkill.INTERMEDIO]: 2,
    [NivelSkill.AVANZADO]: 3,
  };

  private readonly BATCH_SIZE = 10;
  private readonly SKILLS_CACHE_TTL = 5 * 60 * 1000;

  private skillsCache: { data: Skill[]; timestamp: number } | null = null;

  constructor(
    @InjectRepository(MatchResult)
    private readonly matchResultRepo: Repository<MatchResult>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  async matchStudentToJob(
    userId: number,
    jobId: number,
    options?: MatchingOptions,
  ): Promise<MatchResult> {
    const profile = await this.getProfileByUserId(userId);

    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Vacante ${jobId} no encontrada`);
    }

    const allSkills = await this.getAllSkillsCached();

    const { score, matchedSkills, missingSkills, justification } =
      this.matchStudentToJobInternal(profile, job, allSkills);

    let finalJustification = justification;

    if (options?.useAI) {
      const requiredSkills = this.extractSkillsFromText(
        `${job.titulo} ${job.descripcion} ${job.ubicacion}`,
        allSkills,
      );
      finalJustification = await this.generateJustificationWithAI(
        score,
        matchedSkills,
        missingSkills,
        requiredSkills,
        profile,
        job,
      ).catch(() => justification);
    }

    return this.upsertMatchResult(
      profile.id,
      jobId,
      score,
      finalJustification,
      missingSkills,
    );
  }

  async matchStudentToAllJobs(
    userId: number,
    options?: MatchingOptions,
  ): Promise<MatchResult[]> {
    const profile = await this.getProfileByUserId(userId);

    if (!profile.studentSkills?.length) {
      this.logger.warn(`Student ${userId} has no skills, skipping matching`);
      return [];
    }

    const allSkills = await this.getAllSkillsCached();

    const thirtyDaysAgo = subDays(new Date(), 30);
    const jobs = await this.jobRepo.find({
      where: { fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) },
    });

    const calculatedResults: Array<{
      job: Job;
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
      justification: string;
    }> = [];

    for (const job of jobs) {
      try {
        const result = this.matchStudentToJobInternal(profile, job, allSkills);
        calculatedResults.push({ job, ...result });
      } catch (error: any) {
        this.logger.error(
          `Error matching student ${profile.id} to job ${job.id}: ${error.message}`,
        );
      }
    }

    const matchResults: MatchResult[] = [];
    for (let i = 0; i < calculatedResults.length; i += this.BATCH_SIZE) {
      const batch = calculatedResults.slice(i, i + this.BATCH_SIZE);
      const upserted = await Promise.all(
        batch.map((r) =>
          this.upsertMatchResult(
            profile.id,
            r.job.id,
            r.score,
            r.justification,
            r.missingSkills,
          ),
        ),
      );
      matchResults.push(...upserted);
    }

    if (options?.useAI && calculatedResults.length > 0) {
      const sorted = [...calculatedResults].sort((a, b) => b.score - a.score);
      const top10 = sorted.slice(0, 10);

      for (const r of top10) {
        const requiredSkills = this.extractSkillsFromText(
          `${r.job.titulo} ${r.job.descripcion} ${r.job.ubicacion}`,
          allSkills,
        );
        const aiJustification = await this.generateJustificationWithAI(
          r.score,
          r.matchedSkills,
          r.missingSkills,
          requiredSkills,
          profile,
          r.job,
        ).catch(() => r.justification);

        await this.matchResultRepo.update(
          { student_id: profile.id, job_id: r.job.id },
          { justificacion_ia: aiJustification },
        );

        const mr = matchResults.find((m) => m.job_id === r.job.id);
        if (mr) mr.justificacion_ia = aiJustification;
      }
    }

    return matchResults;
  }

  async matchStudentToNewJobs(
    userId: number,
    jobIds: number[],
    options?: MatchingOptions,
  ): Promise<MatchResult[]> {
    if (jobIds.length === 0) return [];

    const profile = await this.getProfileByUserId(userId);

    if (!profile.studentSkills?.length) {
      return [];
    }

    const allSkills = await this.getAllSkillsCached();

    const jobs = await this.jobRepo.find({
      where: { id: In(jobIds) },
    });

    const matchResults: MatchResult[] = [];
    for (const job of jobs) {
      try {
        const { score, matchedSkills, missingSkills, justification } =
          this.matchStudentToJobInternal(profile, job, allSkills);
        const mr = await this.upsertMatchResult(
          profile.id,
          job.id,
          score,
          justification,
          missingSkills,
        );
        matchResults.push(mr);
      } catch (error: any) {
        this.logger.error(
          `Error matching student ${profile.id} to new job ${job.id}: ${error.message}`,
        );
      }
    }

    if (options?.useAI && matchResults.length > 0) {
      const sorted = [...matchResults].sort((a, b) => b.score - a.score);
      const top10 = sorted.slice(0, 10);

      for (const mr of top10) {
        const job = jobs.find((j) => j.id === mr.job_id);
        if (!job) continue;

        const requiredSkills = this.extractSkillsFromText(
          `${job.titulo} ${job.descripcion} ${job.ubicacion}`,
          allSkills,
        );
        const aiJustification = await this.generateJustificationWithAI(
          mr.score,
          [],
          mr.missing_skills ?? [],
          requiredSkills,
          profile,
          job,
        ).catch(() => mr.justificacion_ia);

        mr.justificacion_ia = aiJustification;
        await this.matchResultRepo.update(
          { student_id: profile.id, job_id: job.id },
          { justificacion_ia: aiJustification },
        );
      }
    }

    return matchResults;
  }

  async matchAllStudentsToAllJobs(): Promise<
    { studentId: number; count: number }[]
  > {
    const profiles = await this.profileRepo.find();
    const results: { studentId: number; count: number }[] = [];

    for (const profile of profiles) {
      try {
        const matches = await this.matchStudentToAllJobs(profile.user_id);
        results.push({ studentId: profile.user_id, count: matches.length });
      } catch (error: any) {
        this.logger.error(
          `Error processing matches for student ${profile.id}: ${error.message}`,
        );
        results.push({ studentId: profile.id, count: 0 });
      }
    }
    return results;
  }

  async matchAllStudentsToNewJobs(
    jobIds: number[],
  ): Promise<{ studentId: number; count: number }[]> {
    if (jobIds.length === 0) return [];

    const profiles = await this.profileRepo.find();
    const results: { studentId: number; count: number }[] = [];

    for (const profile of profiles) {
      try {
        const matches = await this.matchStudentToNewJobs(profile.user_id, jobIds);
        results.push({ studentId: profile.user_id, count: matches.length });
      } catch (error: any) {
        this.logger.error(
          `Error processing new-job matches for student ${profile.id}: ${error.message}`,
        );
        results.push({ studentId: profile.id, count: 0 });
      }
    }
    return results;
  }

  async getMatchesForUser(
    userId: number,
    options?: MatchesQueryDto,
  ): Promise<{
    data: MatchResult[];
    total: number;
    page: number;
    limit: number;
  }> {
    const profile = await this.getProfileByUserId(userId);
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.matchResultRepo.findAndCount({
      where: {
        student_id: profile.id,
        score:
          options?.minScore !== undefined
            ? MoreThanOrEqual(options.minScore)
            : undefined,
      },
      relations: ['job'],
      order: { score: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getMatchById(matchId: number, userId: number): Promise<MatchResult> {
    const profile = await this.getProfileByUserId(userId);
    const match = await this.matchResultRepo.findOne({
      where: { id: matchId, student_id: profile.id },
      relations: ['job'],
    });

    if (!match) {
      throw new NotFoundException(`Match #${matchId} no encontrado`);
    }

    return match;
  }

  private async getProfileByUserId(userId: number): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { user_id: userId },
      relations: ['studentSkills', 'studentSkills.skill'],
    });
    if (!profile) {
      throw new NotFoundException(
        'Perfil del estudiante no encontrado. Crea un perfil primero.',
      );
    }
    return profile;
  }

  private async getAllSkillsCached(): Promise<Skill[]> {
    if (
      this.skillsCache &&
      Date.now() - this.skillsCache.timestamp < this.SKILLS_CACHE_TTL
    ) {
      return this.skillsCache.data;
    }
    const skills = await this.skillRepo.find();
    this.skillsCache = { data: skills, timestamp: Date.now() };
    return skills;
  }

  private matchStudentToJobInternal(
    profile: Profile,
    job: Job,
    allSkills: Skill[],
  ): {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    justification: string;
  } {
    const requiredSkills = this.extractSkillsFromText(
      `${job.titulo} ${job.descripcion} ${job.ubicacion}`,
      allSkills,
    );

    const studentSkillMap = new Map<string, StudentSkill>();
    for (const ss of profile.studentSkills) {
      studentSkillMap.set(ss.skill.nombre.toLowerCase(), ss);
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of requiredSkills) {
      if (studentSkillMap.has(skill.nombre.toLowerCase())) {
        matchedSkills.push(skill.nombre);
      } else {
        missingSkills.push(skill.nombre);
      }
    }

    const score = this.calculateScore(
      profile,
      job,
      matchedSkills,
      requiredSkills,
      studentSkillMap,
    );

    const justification = this.generateJustificationWithRules(
      score,
      matchedSkills,
      missingSkills,
      requiredSkills,
      profile,
      job,
    );

    return { score, matchedSkills, missingSkills, justification };
  }

  private async upsertMatchResult(
    studentId: number,
    jobId: number,
    score: number,
    justification: string,
    missingSkills: string[],
  ): Promise<MatchResult> {
    await this.matchResultRepo.upsert(
      {
        student_id: studentId,
        job_id: jobId,
        score,
        justificacion_ia: justification,
        missing_skills: missingSkills,
        fecha_analisis: new Date(),
      },
      {
        conflictPaths: ['student_id', 'job_id'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return this.matchResultRepo.findOneOrFail({
      where: { student_id: studentId, job_id: jobId },
    });
  }

  private extractSkillsFromText(text: string, allSkills: Skill[]): Skill[] {
    const lowerText = text.toLowerCase();
    return allSkills.filter((skill) => {
      const escaped = skill.nombre
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(lowerText);
    });
  }

  private calculateScore(
    profile: Profile,
    job: Job,
    matchedSkills: string[],
    requiredSkills: Skill[],
    studentSkillMap: Map<string, StudentSkill>,
  ): number {
    const totalRequired = requiredSkills.length;

    let skillsScore = 0;
    if (totalRequired > 0) {
      skillsScore = (matchedSkills.length / totalRequired) * 50;
    } else {
      skillsScore = 25;
    }

    let levelScore = 0;
    if (matchedSkills.length > 0) {
      let totalLevelRatio = 0;
      for (const skillName of matchedSkills) {
        const ss = studentSkillMap.get(skillName.toLowerCase());
        if (ss) {
          totalLevelRatio += this.NIVEL_VALUES[ss.nivel] / 3;
        }
      }
      levelScore = (totalLevelRatio / matchedSkills.length) * 20;
    } else if (totalRequired > 0) {
      levelScore = 0;
    } else {
      levelScore = 10;
    }

    const modalityScore = this.calculateModalityScore(profile, job);
    const locationScore = this.calculateLocationScore(job);

    const rawScore = skillsScore + levelScore + modalityScore + locationScore;
    return Math.round(Math.min(100, Math.max(0, rawScore)));
  }

  private calculateModalityScore(profile: Profile, job: Job): number {
    const jobModality = this.inferModality(job);
    const pref = profile.modalidad_preferida;

    if (!pref || !jobModality) return 7.5;

    if (pref === jobModality) return 15;

    if (pref === Modalidad.REMOTO && jobModality === Modalidad.HIBRIDO)
      return 10;
    if (pref === Modalidad.PRESENCIAL && jobModality === Modalidad.HIBRIDO)
      return 10;
    if (pref === Modalidad.HIBRIDO) return 10;

    return 0;
  }

  private calculateLocationScore(job: Job): number {
    if (this.isRemoteJob(job)) return 15;

    const ubicacion = job.ubicacion?.toLowerCase() ?? '';
    if (ubicacion && ubicacion !== 'remote' && !ubicacion.includes('remoto')) {
      return 7.5;
    }

    return 7.5;
  }

  private inferModality(job: Job): Modalidad | null {
    const searchText = [job.titulo, job.descripcion, job.ubicacion]
      .join(' ')
      .toLowerCase();

    if (
      /remoto|remota|work\s*from\s*home|home\s*office|teletrabajo/i.test(
        searchText,
      ) &&
      !/presencial|on\s*site|onsite/i.test(searchText)
    ) {
      return Modalidad.REMOTO;
    }

    if (/hibrido|híbrido|hybrid/i.test(searchText)) {
      return Modalidad.HIBRIDO;
    }

    if (/presencial|on\s*site|onsite/i.test(searchText)) {
      return Modalidad.PRESENCIAL;
    }

    const ubi = job.ubicacion?.toLowerCase() ?? '';
    if (/remote|remoto/i.test(ubi)) return Modalidad.REMOTO;

    return null;
  }

  private isRemoteJob(job: Job): boolean {
    const modality = this.inferModality(job);
    return modality === Modalidad.REMOTO;
  }

  private generateJustificationWithRules(
    score: number,
    matchedSkills: string[],
    missingSkills: string[],
    requiredSkills: Skill[],
    profile: Profile,
    job: Job,
  ): string {
    const totalRequired = requiredSkills.length;
    const parts: string[] = [];

    if (matchedSkills.length > 0) {
      parts.push(
        `Coincidencia del ${score}%: Tienes ${matchedSkills.length} de ${totalRequired} skills requeridas (${matchedSkills.join(', ')}).`,
      );
    } else {
      parts.push(
        `Coincidencia del ${score}%: No se encontraron skills coincidentes entre tu perfil y la vacante.`,
      );
    }

    if (missingSkills.length > 0) {
      const verbo = missingSkills.length === 1 ? 'Te falta' : 'Te faltan';
      parts.push(
        `${verbo} ${missingSkills.length} skill${missingSkills.length > 1 ? 's' : ''}: ${missingSkills.join(', ')}.`,
      );
    }

    if (matchedSkills.length > 0) {
      const niveles = this.describeSkillLevels(matchedSkills, profile);
      if (niveles) parts.push(niveles);
    }

    const jobModality = this.inferModality(job);
    const pref = profile.modalidad_preferida;
    if (pref && jobModality) {
      if (pref === jobModality) {
        parts.push(`La modalidad ${jobModality} coincide con tu preferencia.`);
      } else if (jobModality === Modalidad.HIBRIDO) {
        parts.push(
          `La modalidad ${jobModality} ofrece flexibilidad compatible con tu preferencia (${pref}).`,
        );
      } else {
        parts.push(
          `La modalidad ${jobModality} es diferente a tu preferencia (${pref}).`,
        );
      }
    }

    if (this.isRemoteJob(job)) {
      parts.push('La posición ofrece trabajo remoto.');
    }

    return parts.join(' ');
  }

  private describeSkillLevels(
    matchedSkills: string[],
    profile: Profile,
  ): string | null {
    const avanzadas: string[] = [];
    const intermedias: string[] = [];
    const basicas: string[] = [];

    for (const ss of profile.studentSkills) {
      if (matchedSkills.includes(ss.skill.nombre)) {
        switch (ss.nivel) {
          case NivelSkill.AVANZADO:
            avanzadas.push(ss.skill.nombre);
            break;
          case NivelSkill.INTERMEDIO:
            intermedias.push(ss.skill.nombre);
            break;
          case NivelSkill.BASICO:
            basicas.push(ss.skill.nombre);
            break;
        }
      }
    }

    const levelParts: string[] = [];
    if (avanzadas.length > 0)
      levelParts.push(`Nivel avanzado en ${avanzadas.join(', ')}`);
    if (intermedias.length > 0)
      levelParts.push(`Nivel intermedio en ${intermedias.join(', ')}`);
    if (basicas.length > 0)
      levelParts.push(`Nivel básico en ${basicas.join(', ')}`);

    return levelParts.length > 0 ? levelParts.join('. ') + '.' : null;
  }

  private async generateJustificationWithAI(
    score: number,
    matchedSkills: string[],
    missingSkills: string[],
    requiredSkills: Skill[],
    profile: Profile,
    job: Job,
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return this.generateJustificationWithRules(
        score,
        matchedSkills,
        missingSkills,
        requiredSkills,
        profile,
        job,
      );
    }

    const prompt = `Eres un asesor de carrera universitario. Genera una justificación breve y motivacional para un estudiante sobre su compatibilidad con una vacante.

Datos del match:
- Score: ${score}/100
- Skills del estudiante: ${profile.studentSkills.map((ss) => `${ss.skill.nombre} (${ss.nivel})`).join(', ')}
- Skills requeridas por la vacante: ${requiredSkills.map((s) => s.nombre).join(', ')}
- Skills coincidentes: ${matchedSkills.join(', ') || 'ninguna'}
- Skills faltantes: ${missingSkills.join(', ') || 'ninguna'}
- Título de la vacante: ${job.titulo}
- Empresa: ${job.empresa}
- Modalidad preferida del estudiante: ${profile.modalidad_preferida || 'no especificada'}
- Ubicación de la vacante: ${job.ubicacion}

Genera exactamente 2-3 oraciones explicando la compatibilidad.
Responde ÚNICAMENTE con el texto de la justificación, sin frases introductorias,
saludos, títulos ni prefijos de ningún tipo. Empieza directamente con el mensaje.`;

    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const timeout = parseInt(process.env.GEMINI_TIMEOUT || '30000', 10);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout,
        },
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch (error: any) {
      this.logger.warn(
        `Gemini API error: ${error.message}, falling back to rules`,
      );
    }
    return this.generateJustificationWithRules(
      score,
      matchedSkills,
      missingSkills,
      requiredSkills,
      profile,
      job,
    );
  }
}
