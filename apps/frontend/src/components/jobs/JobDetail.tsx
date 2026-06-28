import { useRouter } from "next/navigation";
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
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        ← Volver
      </button>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job.titulo}</h1>
          <p className="text-lg text-gray-600 mt-1">{job.empresa}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
            {job.ubicacion && (
              <>
                <span>{job.ubicacion}</span>
                <span className="text-gray-300">|</span>
              </>
            )}
            <span>
              Publicado:{" "}
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
              Match
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
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold h-11 px-6 text-sm shadow-sm transition-colors"
        >
          Postularme
        </a>
        <button
          onClick={() => router.push(`/jobs?empresa=${encodeURIComponent(job.empresa)}`)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 h-11 px-5 text-sm font-medium transition-colors"
        >
          Ver vacantes similares
        </button>
      </div>

      {/* Match section */}
      {match && match.justificacion_ia && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Justificación del match</h3>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Descripción completa</h2>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {job.descripcion}
        </div>
      </div>
    </div>
  );
};
