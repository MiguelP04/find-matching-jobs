import Link from "next/link";
import { Job } from "../../types/job";

export const JobCard = ({ job }: { job: Job }) => (
  <Link
    href={`/jobs/${job.id}`}
    className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
          {job.titulo}
        </h3>
        <p className="text-gray-600">{job.empresa}</p>
        <p className="text-sm text-gray-500 mt-1">{job.ubicacion}</p>
        <p className="text-xs text-gray-400 mt-2">
          Publicado:{" "}
          {new Date(job.fecha_publicacion).toLocaleDateString("es-ES")}
        </p>
      </div>
    </div>

  </Link>
);
