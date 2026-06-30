import Link from "next/link";
import { Building2, MapPin, Clock } from "lucide-react";
import { Job } from "../../types/job";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export const JobCard = ({ job }: { job: Job }) => (
  <Link
    href={`/jobs/${job.id}`}
    className="relative flex items-start gap-3 px-4 py-3 rounded-lg transition-all hover:bg-muted/50 group"
  >
    <div className="w-[3px] self-stretch rounded-full bg-border group-hover:bg-primary transition-colors shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
        {job.titulo}
      </h3>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
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
    <span className="shrink-0 text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
      <Clock className="size-3" />
      {timeAgo(job.fecha_publicacion)}
    </span>
  </Link>
);
