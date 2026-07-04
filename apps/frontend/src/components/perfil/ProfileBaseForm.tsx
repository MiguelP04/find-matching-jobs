"use client";

import { UseFormRegister } from "react-hook-form";
import { Briefcase, GraduationCap, Globe, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SkillFormValue {
  dbId?: number;
  skillId: number;
  name: string;
  level: "Básico" | "Intermedio" | "Avanzado";
}

interface ProfileFormInputs {
  bio: string;
  semestre: string;
  modalidad: "" | "REMOTO" | "PRESENCIAL" | "HÍBRIDO";
  githubUrl: string;
  linkedinUrl: string;
  skills: SkillFormValue[];
}

interface ProfileBaseFormProps {
  register: UseFormRegister<ProfileFormInputs>;
}

export function ProfileBaseForm({ register }: ProfileBaseFormProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col gap-5">
      <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-3">
        <Briefcase className="size-5 text-muted-foreground" />
        <h2>Perfil Profesional </h2>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Resumen Profesional
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          placeholder="Escribe un resumen sobre tus proyectos, enfoque técnico y metas académicas..."
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            GitHub URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="url"
              placeholder="https://github.com/usuario"
              className="pl-9 h-10"
              {...register("githubUrl")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            LinkedIn URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="url"
              placeholder="https://linkedin.com/in/usuario"
              className="pl-9 h-10"
              {...register("linkedinUrl")}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Semestre Actual
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <select
              {...register("semestre")}
              className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="">Selecciona tu semestre</option>
              {[...Array(9)].map((_, i) => (
                <option
                  key={i + 1}
                  value={i + 1}
                >{`${i + 1}° Semestre`}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Modalidad Preferida
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <select
              {...register("modalidad")}
              className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              <option value="">Selecciona una modalidad</option>
              <option value="REMOTO">Remoto</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="HÍBRIDO">Híbrido</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
