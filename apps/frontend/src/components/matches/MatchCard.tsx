import Link from 'next/link';
import { MatchResult } from '../../types/job';
import { Sparkles, ArrowUpRight, Building2, MapPin, Calendar } from 'lucide-react';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getScoreAccent = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

export const MatchCard = ({ match }: { match: MatchResult }) => {
  const { job, score, justificacion_ia, missing_skills, fecha_analisis } = match;

  return (
    <div className="relative flex gap-4 p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-[4px] shrink-0 rounded-full ${getScoreAccent(score)}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {job.titulo}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
              <Building2 className="size-3.5 shrink-0" />
              <span>{job.empresa}</span>
              {job.ubicacion && (
                <>
                  <span className="text-border">|</span>
                  <MapPin className="size-3.5 shrink-0" />
                  <span>{job.ubicacion}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getScoreBg(score)}`}>
              <span>{score}</span>
              <span className="font-normal">puntos</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5 shrink-0" />
            Publicado: {new Date(job.fecha_publicacion).toLocaleDateString('es-ES')}
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5 shrink-0" />
            Analizado: {new Date(fecha_analisis).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {justificacion_ia && (
          <div className="mt-3 p-3 rounded-lg bg-muted border border-border">
            <div className="flex items-start gap-2">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">{justificacion_ia}</p>
            </div>
          </div>
        )}

        {missing_skills && missing_skills.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {missing_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-destructive/10 text-destructive text-[11px] font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <a
            href={job.url_postulacion}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Postularme <ArrowUpRight className="size-3" />
          </a>
          <span className="text-border">|</span>
          <Link
            href={`/jobs/${job.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver vacante
          </Link>
        </div>
      </div>
    </div>
  );
};
