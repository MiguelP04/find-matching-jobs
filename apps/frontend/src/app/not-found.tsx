import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="flex items-center justify-center size-14 rounded-full bg-muted">
          <span className="text-2xl font-bold text-muted-foreground">404</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-10 px-5 text-sm font-semibold shadow-sm hover:bg-primary/80 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
