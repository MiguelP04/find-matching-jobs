import { Bot } from "lucide-react";

export default function MatchesCard() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5"><Bot className="size-4" /> Recomendaciones</h2>
      <p className="text-xs text-muted-foreground">
        Aún no tienes recomendaciones. Completa tu perfil y skills para recibir sugerencias personalizadas.
      </p>
    </div>
  );
}