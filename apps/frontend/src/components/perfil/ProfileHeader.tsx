"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button"; // O la ruta donde tengas tu UI Button

interface ProfileHeaderProps {
  isSubmitting: boolean;
  onSaveTrigger: () => void;
}

export function ProfileHeader({
  isSubmitting,
  onSaveTrigger,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors shadow-2xs"
          title="Regresar al Dashboard"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Perfil de Habilidades
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Actualiza tu identidad profesional y destaca tus capacidades de
            ingeniería.
          </p>
        </div>
      </div>
      <Button
        type="button"
        onClick={onSaveTrigger}
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold gap-2 shadow-sm w-full md:w-auto px-4 h-10 transition-colors disabled:opacity-50"
      >
        <Save className="size-4" />
        {isSubmitting ? "Sincronizando..." : "Guardar Cambios"}
      </Button>
    </div>
  );
}
