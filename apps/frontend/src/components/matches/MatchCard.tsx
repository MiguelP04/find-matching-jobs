import { MatchResult } from '../../types/job';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getScoreTextColor = (score: number) => {
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-yellow-700';
  return 'text-red-700';
};

export const MatchCard = ({ match }: { match: MatchResult }) => {
  const { job, score, justificacion_ia, missing_skills, fecha_analisis } = match;

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{job.titulo}</h3>
          <p className="text-gray-600">{job.empresa}</p>
          <div className="flex gap-2 text-sm text-gray-500 mt-2">
            <span>{job.ubicacion}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Publicado el: {new Date(job.fecha_publicacion).toLocaleDateString('es-ES')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Analizado el: {new Date(fecha_analisis).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex flex-col items-center ml-4">
          <div
            className={`w-14 h-14 rounded-full ${getScoreColor(score)} flex items-center justify-center text-white font-bold text-lg`}
          >
            {score}
          </div>
          <span className={`text-xs font-semibold mt-1 ${getScoreTextColor(score)}`}>
            Match
          </span>
        </div>
      </div>

      {justificacion_ia && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-blue-800">{justificacion_ia}</p>
        </div>
      )}

      {missing_skills && missing_skills.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">Skills faltantes: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {missing_skills.map((skill) => (
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

      <div className="mt-3 flex justify-end">
        <a
          href={job.url_postulacion}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Ver detalle de la vacante →
        </a>
      </div>
    </div>
  );
};
