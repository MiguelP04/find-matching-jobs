import { useRouter } from "next/navigation";
import { Building2, MapPin, Calendar } from "lucide-react";
import type { JobDetailResponse } from "@/types/job";

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const getScoreTextColor = (score: number) => {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-yellow-700";
  return "text-red-700";
};

export const JobDetail = ({ job }: { job: JobDetailResponse }) => {
  const router = useRouter();
  const { match } = job;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Volver
      </button>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{job.titulo}</h1>
          <p className="flex items-center gap-1.5 text-base text-muted-foreground mt-1">
            <Building2 className="size-4 shrink-0" />
            <span>{job.empresa}</span>
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            {job.ubicacion && (
              <>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" />
                  {job.ubicacion}
                </span>
                <span className="text-border">|</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 shrink-0" />
              {new Date(job.fecha_publicacion).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {match && (
          <div className="flex flex-col items-center ml-6">
            <div
              className={`w-16 h-16 rounded-full ${getScoreColor(match.score)} flex items-center justify-center text-white font-bold text-xl`}
            >
              {match.score}
            </div>
            <span className={`text-xs font-semibold mt-1 ${getScoreTextColor(match.score)}`}>
              Coincidencia
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <a
          href={job.url_postulacion}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold h-11 px-6 text-sm shadow-sm transition-colors hover:bg-primary/80"
        >
          Postularme
        </a>
        <button
          onClick={() => router.push(`/jobs?empresa=${encodeURIComponent(job.empresa)}`)}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground h-11 px-5 text-sm font-medium transition-colors"
        >
          Ver vacantes similares
        </button>
      </div>

      {/* Match section */}
      {match && match.justificacion_ia && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Justificación</h3>
          <p className="text-sm text-blue-800 leading-relaxed">{match.justificacion_ia}</p>
          {match.missing_skills && match.missing_skills.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-blue-900">Skills faltantes: </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {match.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full description */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Descripción completa</h2>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {job.descripcion}
        </div>
      </div>
    </div>
  );
};
