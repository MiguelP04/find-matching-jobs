/////////////////////////////////////////////////////////////////////////
// Imports
/////////////////////////////////////////////////////////////////////////
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
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

/////////////////////////////////////////////////////////////////////////
// Servicio principal de Matching
// - Compara perfil del estudiante vs vacantes
// - Calcula score numérico (0-100)
// - Genera justificación (Opción A: Gemini API | Opción B: Reglas)
// - Persiste resultados en Match_Results vía UPSERT
/////////////////////////////////////////////////////////////////////////
@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  // Mapeo de niveles a valores numéricos para el cálculo de score
  private readonly NIVEL_VALUES: Record<NivelSkill, number> = {
    [NivelSkill.BASICO]: 1,
    [NivelSkill.INTERMEDIO]: 2,
    [NivelSkill.AVANZADO]: 3,
  };

  /////////////////////////////////////////////////////////////////////////
  // Constructor: inyecta repositorios y servicios
  /////////////////////////////////////////////////////////////////////////
  constructor(
    @InjectRepository(MatchResult)
    private readonly matchResultRepo: Repository<MatchResult>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(StudentSkill)
    private readonly configService: ConfigService,
  ) {}

  /////////////////////////////////////////////////////////////////////////
  // Métodos públicos
  /////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////
  // matchStudentToJob: Matching individual (userId vs vacante)
  // 1. Resuelve userId → profile.id
  // 2. Carga perfil con skills del estudiante + vacante
  // 3. Extrae skills requeridas desde la descripción de la vacante
  // 4. Compara skills: genera matchedSkills[] y missingSkills[]
  // 5. Calcula score numérico (0-100)
  // 6. Genera justificación (según options.useAI)
  // 7. Persiste vía UPSERT en match_results
  /////////////////////////////////////////////////////////////////////////
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

    const allSkills = await this.skillRepo.find();

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

    const useAI = options?.useAI ?? false;
    let justification: string;

    if (useAI) {
      justification = await this.generateJustificationWithAI(
        score,
        matchedSkills,
        missingSkills,
        requiredSkills,
        profile,
        job,
      ).catch(() =>
        this.generateJustificationWithRules(
          score,
          matchedSkills,
          missingSkills,
          requiredSkills,
          profile,
          job,
        ),
      );
    } else {
      justification = this.generateJustificationWithRules(
        score,
        matchedSkills,
        missingSkills,
        requiredSkills,
        profile,
        job,
      );
    }

    return this.upsertMatchResult(
      profile.id,
      jobId,
      score,
      justification,
      missingSkills,
    );
  }

  /////////////////////////////////////////////////////////////////////////
  // matchStudentToAllJobs: Matching de un estudiante vs todas las vacantes activas (< 30 días)
  /////////////////////////////////////////////////////////////////////////
  async matchStudentToAllJobs(
    userId: number,
    options?: MatchingOptions,
  ): Promise<MatchResult[]> {
    const profile = await this.getProfileByUserId(userId);

    const thirtyDaysAgo = subDays(new Date(), 30);
    const jobs = await this.jobRepo.find({
      where: { fecha_publicacion: MoreThanOrEqual(thirtyDaysAgo) },
    });

    const results: MatchResult[] = [];
    for (const job of jobs) {
      try {
        const result = await this.matchStudentToJob(userId, job.id, options);
        results.push(result);
      } catch (error: any) {
        this.logger.error(
          `Error matching student ${profile.id} to job ${job.id}: ${error.message}`,
        );
      }
    }
    return results;
  }

  /////////////////////////////////////////////////////////////////////////
  // matchAllStudentsToAllJobs: Matching masivo (todos los estudiantes vs todas las vacantes activas)
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // getMatchesForUser: Retorna los resultados de matching del usuario actual
  // Resuelve userId → profile, busca match_results con job, ordena por score DESC
  // Soporta paginación (page/limit) y filtro por score mínimo (minScore)
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // getMatchById: Retorna un match específico por ID, validando que
  // pertenezca al usuario autenticado
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // Métodos privados - Utilidades
  /////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////
  // getProfileByUserId: Busca el perfil asociado a un userId
  // Lanza NotFoundException si no existe
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // Métodos privados - Extracción de skills desde texto
  /////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////
  // extractSkillsFromText: Busca skills del catálogo dentro del texto de la vacante
  // Usa regex con word boundaries para evitar falsos positivos
  // Ej: "React" no matchea con "Reactivate"
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // Métodos privados - Cálculo de score
  /////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////
  // calculateScore: Calcula score numérico (0-100)
  // Distribución:
  //   - Skills coincidentes:   50%
  //   - Nivel de experiencia:  20%
  //   - Modalidad preferida:   15%
  //   - Ubicación/Remoto:     15%
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // calculateModalityScore: 15% del score total
  // - Match exacto entre modalidad preferida y ofrecida = 15pts
  // - Match parcial (híbrido con preferencia remoto/presencial) = 10pts
  // - Sin datos = 7.5pts (neutro)
  // - Sin coincidencia = 0pts
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // calculateLocationScore: 15% del score total
  // - Trabajo remoto = 15pts (accesible para todos)
  // - Ubicación fija = 7.5pts (neutro, no podemos determinar cercanía)
  /////////////////////////////////////////////////////////////////////////
  private calculateLocationScore(job: Job): number {
    if (this.isRemoteJob(job)) return 15;

    const ubicacion = job.ubicacion?.toLowerCase() ?? '';
    if (ubicacion && ubicacion !== 'remote' && !ubicacion.includes('remoto')) {
      return 7.5;
    }

    return 7.5;
  }

  /////////////////////////////////////////////////////////////////////////
  // Métodos privados - Inferencia de modalidad desde la vacante
  /////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////
  // inferModality: Extrae la modalidad de la vacante analizando
  // título, descripción y ubicación con regex
  // Retorna: REMOTO | HIBRIDO | PRESENCIAL | null (no detectable)
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // isRemoteJob: Atajo para saber si una vacante es remota
  /////////////////////////////////////////////////////////////////////////
  private isRemoteJob(job: Job): boolean {
    const modality = this.inferModality(job);
    return modality === Modalidad.REMOTO;
  }

  /////////////////////////////////////////////////////////////////////////
  // Opción B: Justificación con reglas predefinidas (default)
  // Genera texto explicativo usando plantillas condicionales
  // No requiere API externa, funciona offline
  /////////////////////////////////////////////////////////////////////////

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

  /////////////////////////////////////////////////////////////////////////
  // describeSkillLevels: Agrupa skills coincidentes por nivel para la justificación
  // Ej: "Nivel avanzado en React, Node.js. Nivel intermedio en TypeScript."
  /////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////
  // Opción A: Justificación con Gemini API
  // Usa el modelo gemini-3.5-flash para generar texto explicativo natural
  // Requiere GEMINI_API_KEY en .env
  // Fallback automático a Opción B si:
  //   - No hay API key configurada
  //   - La llamada a la API falla (timeout, error de red, etc.)
  /////////////////////////////////////////////////////////////////////////
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

Genera un texto de 2-3 oraciones explicando el resultado de forma clara y útil para el estudiante.`;

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

  /////////////////////////////////////////////////////////////////////////
  // Métodos privados - Persistencia
  /////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////
  // upsertMatchResult: Inserta o actualiza el resultado en match_results
  // Si ya existe un registro para (student_id, job_id) → UPDATE
  // Si no existe → INSERT
  // Esto evita duplicados al re-ejecutar el matching
  /////////////////////////////////////////////////////////////////////////
  private async upsertMatchResult(
    studentId: number,
    jobId: number,
    score: number,
    justification: string,
    missingSkills: string[],
  ): Promise<MatchResult> {
    const existing = await this.matchResultRepo.findOne({
      where: { student_id: studentId, job_id: jobId },
    });

    if (existing) {
      existing.score = score;
      existing.justificacion_ia = justification;
      existing.missing_skills = missingSkills;
      existing.fecha_analisis = new Date();
      return this.matchResultRepo.save(existing);
    }

    const matchResult = this.matchResultRepo.create({
      student_id: studentId,
      job_id: jobId,
      score,
      justificacion_ia: justification,
      missing_skills: missingSkills,
      fecha_analisis: new Date(),
    });

    return this.matchResultRepo.save(matchResult);
  }
}
