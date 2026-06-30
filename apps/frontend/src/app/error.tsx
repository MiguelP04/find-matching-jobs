"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="flex items-center justify-center size-14 rounded-full bg-destructive/10">
          <span className="text-2xl font-bold text-destructive">!</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ocurrió un error inesperado. Intenta de nuevo más tarde.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-10 px-5 text-sm font-semibold shadow-sm hover:bg-primary/80 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
