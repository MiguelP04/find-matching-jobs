import { Job } from '../../types/job';

export const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold">{job.title}</h3>
      <p className="text-gray-600">{job.company}</p>
      <div className="flex gap-2 text-sm text-gray-500 mt-2">
        <span>{job.location}</span>
        <span>•</span>
        <span>{job.modality}</span>
      </div>
      <p className="text-xs text-gray-400 mt-2">Publicado el: {job.publishedAt}</p>
      <div className="mt-2 font-bold text-blue-600">Score: {job.score}</div>
    </div>
  );
};
