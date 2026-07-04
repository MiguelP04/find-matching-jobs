"use client";

import { Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { UseFormSetValue, FieldArrayWithId } from "react-hook-form";
import {
  SkillFormValue,
  ProfileFormInputs,
  CatalogSkill,
} from "@/app/perfil/page";

interface SkillsFormProps {
  fields: FieldArrayWithId<ProfileFormInputs, "skills">[];
  remove: (index: number) => void;
  setValue: UseFormSetValue<ProfileFormInputs>;
  catalogSkills: CatalogSkill[]; // Catálogo inyectado remotamente
  selectedCatalogSkillId: string;
  setSelectedCatalogSkillId: (value: string) => void;
  onAddSkill: () => void;
}

export function SkillsForm({
  fields,
  remove,
  setValue,
  catalogSkills,
  selectedCatalogSkillId,
  setSelectedCatalogSkillId,
  onAddSkill,
}: SkillsFormProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <SlidersHorizontal className="size-5 text-muted-foreground" />
          <h2>Habilidades y Experiencia</h2>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {fields.length} Seleccionadas
        </span>
      </div>

      {/* Selector Dinámico conectado a Base de Datos */}
      <div className="flex flex-col sm:flex-row gap-3 bg-muted p-4 rounded-lg border border-border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <select
            value={selectedCatalogSkillId}
            onChange={(e) => setSelectedCatalogSkillId(e.target.value)}
            disabled={catalogSkills.length === 0}
            className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-hidden focus:border-ring disabled:opacity-75 disabled:bg-muted"
          >
            {catalogSkills.length === 0 ? (
              <option value="">
                No hay habilidades cargadas en el sistema
              </option>
            ) : (
              <option value="">
                Selecciona una habilidad técnica del catálogo...
              </option>
            )}

            {catalogSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onAddSkill}
          disabled={catalogSkills.length === 0 || !selectedCatalogSkillId}
          className="inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground gap-2 h-10 px-4 text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" /> Agregar Skill
        </button>
      </div>

      {/* Grid de Tarjetas de las habilidades del Estudiante */}
      {fields.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
          Aún no has agregado ninguna habilidad a tu perfil.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-border rounded-xl p-4 flex flex-col gap-4 bg-card relative hover:shadow-2xs transition-shadow"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted"
              >
                <Trash2 className="size-4" />
              </button>

              <div>
                <h4 className="font-semibold text-foreground pr-6">
                  {field.name}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-muted p-1.5 rounded-lg border border-border">
                {(["Básico", "Intermedio", "Avanzado"] as const).map(
                  (levelOption) => (
                    <label
                      key={levelOption}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium cursor-pointer transition-all border text-center select-none
                      ${
                        field.level === levelOption
                          ? "bg-primary/10 border-primary/30 text-primary-foreground shadow-2xs"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }
                    `}
                    >
                      <input
                        type="radio"
                        value={levelOption}
                        className="sr-only"
                        checked={field.level === levelOption}
                        onChange={() =>
                          setValue(`skills.${index}.level`, levelOption)
                        }
                      />
                      {levelOption}
                    </label>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
