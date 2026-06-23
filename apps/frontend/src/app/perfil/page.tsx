"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ProfileHeader } from "@/components/perfil/ProfileHeader";
import { ProfileBaseForm } from "@/components/perfil/ProfileBaseForm";
import { SkillsForm } from "@/components/perfil/SkillsForm";

export interface CatalogSkill {
  id: number;
  nombre: string;
}

export interface SkillFormValue {
  dbId?: number;
  skillId: number;
  name: string;
  level: "Básico" | "Intermedio" | "Avanzado";
}

export interface ProfileFormInputs {
  bio: string;
  semestre: string;
  modalidad: "" | "REMOTO" | "PRESENCIAL" | "HÍBRIDO";
  githubUrl: string;
  linkedinUrl: string;
  skills: SkillFormValue[];
}

export default function ProfileEditPage() {
  const { accessToken } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [catalogSkills, setCatalogSkills] = useState<CatalogSkill[]>([]);
  const [initialSkills, setInitialSkills] = useState<SkillFormValue[]>([]);
  const [selectedCatalogSkillId, setSelectedCatalogSkillId] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const { register, control, handleSubmit, setValue, reset } =
    useForm<ProfileFormInputs>({
      defaultValues: {
        bio: "",
        semestre: "",
        modalidad: "",
        githubUrl: "",
        linkedinUrl: "",
        skills: [],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  useEffect(() => {
    async function loadProfileData() {
      if (!accessToken) return;
      try {
        setGlobalError(null);

        const skillsRes = await api
          .get<any>("/skills", accessToken)
          .catch(() => null);
        const skillsData =
          skillsRes?.data !== undefined ? skillsRes.data : skillsRes;
        if (Array.isArray(skillsData)) {
          setCatalogSkills(skillsData);
        }

        const profileRes = await api
          .get<any>("/profiles/me", accessToken)
          .catch(() => null);
        const profileData =
          profileRes?.data !== undefined ? profileRes.data : profileRes;

        const studentSkillsRes = await api
          .get<any>("/student-skills/me", accessToken)
          .catch(() => null);
        const studentSkillsData =
          studentSkillsRes?.data !== undefined
            ? studentSkillsRes.data
            : studentSkillsRes;

        const mappedSkills: SkillFormValue[] = Array.isArray(studentSkillsData)
          ? studentSkillsData.map((ss: any) => ({
              dbId: ss.id,
              skillId: ss.skill_id,
              name: ss.skill?.nombre ?? "",
              level: ss.nivel as "Básico" | "Intermedio" | "Avanzado",
            }))
          : [];

        setInitialSkills(mappedSkills);

        if (profileData) {
          setHasProfile(true);
          let frontendModalidad: "" | "REMOTO" | "PRESENCIAL" | "HÍBRIDO" = "";
          if (profileData?.modalidad_preferida) {
            const rawMod = profileData.modalidad_preferida.toLowerCase();
            if (rawMod === "remoto") frontendModalidad = "REMOTO";
            if (rawMod === "presencial") frontendModalidad = "PRESENCIAL";
            if (rawMod === "hibrido" || rawMod === "híbrido")
              frontendModalidad = "HÍBRIDO";
          }

          reset({
            bio: profileData?.resumen_profesional || "",
            semestre: profileData?.semestre ? String(profileData.semestre) : "",
            modalidad: frontendModalidad,
            githubUrl: profileData?.github_url || "",
            linkedinUrl: profileData?.linkedin_url || "",
            skills: mappedSkills,
          });
        } else {
          setValue("skills", mappedSkills);
        }
      } catch (err) {
        console.error("Error capturado en carga:", err);
        setGlobalError(
          "Ocurrió un error inesperado al procesar los datos de tu perfil.",
        );
      }
    }

    loadProfileData();
  }, [accessToken, reset, setValue]);

  const handleAddSkill = () => {
    if (!selectedCatalogSkillId) return;

    const targetId = Number(selectedCatalogSkillId);
    const alreadyExists = fields.some((field) => field.skillId === targetId);
    if (alreadyExists) {
      alert("Esta habilidad ya ha sido añadida a tu perfil.");
      return;
    }

    const catalogSkill = catalogSkills.find((s) => s.id === targetId);
    if (catalogSkill) {
      append({
        skillId: catalogSkill.id,
        name: catalogSkill.nombre,
        level: "Básico",
      });
      setSelectedCatalogSkillId("");
    }
  };

  const onSubmit = async (data: ProfileFormInputs) => {
    if (!accessToken) return;
    setIsSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      let backendModalidad: string | null = null;
      if (data.modalidad) {
        backendModalidad = data.modalidad.toLowerCase();
        if (backendModalidad === "híbrido") backendModalidad = "hibrido";
      }

      const backendProfilePayload: Record<string, unknown> = {
        resumen_profesional: data.bio || null,
        github_url: data.githubUrl || null,
        linkedin_url: data.linkedinUrl || null,
        semestre: data.semestre ? Number(data.semestre) : null,
        modalidad_preferida: backendModalidad,
      };

      if (hasProfile) {
        await api.patch("/profiles/me", backendProfilePayload, accessToken);
      } else {
        await api.post("/profiles", backendProfilePayload, accessToken);
        setHasProfile(true);
      }

      const currentSkills = data.skills;
      const currentDbIds = new Set(currentSkills.map((s) => s.dbId).filter(Boolean));

      const toDelete = initialSkills.filter(
        (s) => s.dbId && !currentDbIds.has(s.dbId)
      );

      const toAdd = currentSkills.filter((s) => !s.dbId);

      const toUpdate = currentSkills.filter((s) => {
        if (!s.dbId) return false;
        const original = initialSkills.find((i) => i.dbId === s.dbId);
        return original && original.level !== s.level;
      });

      await Promise.all([
        ...toDelete.map((s) =>
          api.delete(`/student-skills/${s.dbId}`, accessToken)
        ),
        ...toAdd.map((s) =>
          api.post("/student-skills", { skill_id: s.skillId, nivel: s.level }, accessToken)
        ),
        ...toUpdate.map((s) =>
          api.patch(`/student-skills/${s.dbId}`, { nivel: s.level }, accessToken)
        ),
      ]);

      const refreshRes = await api
        .get<any>("/student-skills/me", accessToken)
        .catch(() => null);
      const refreshData =
        refreshRes?.data !== undefined ? refreshRes.data : refreshRes;

      const refreshedSkills: SkillFormValue[] = Array.isArray(refreshData)
        ? refreshData.map((ss: any) => ({
            dbId: ss.id,
            skillId: ss.skill_id,
            name: ss.skill?.nombre ?? "",
            level: ss.nivel as "Básico" | "Intermedio" | "Avanzado",
          }))
        : [];

      setInitialSkills(refreshedSkills);
      setValue("skills", refreshedSkills);

      setSuccessMessage("¡Perfil guardado y habilidades actualizadas!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Error completo en submit:", err);
      setGlobalError(
        err.message || "Ocurrió un error al sincronizar con el servidor.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <ProfileHeader
            isSubmitting={isSubmitting}
            onSaveTrigger={handleSubmit(onSubmit)}
          />

          {globalError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg shadow-xs">
              {globalError}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg shadow-xs">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <ProfileBaseForm register={register} />

            <SkillsForm
              fields={fields}
              remove={remove}
              setValue={setValue}
              catalogSkills={catalogSkills}
              selectedCatalogSkillId={selectedCatalogSkillId}
              setSelectedCatalogSkillId={setSelectedCatalogSkillId}
              onAddSkill={handleAddSkill}
            />

            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Descartar cambios no guardados?")) reset();
                }}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 h-11 px-6 text-sm font-medium transition-colors"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold h-11 px-8 text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sincronizando..." : "GUARDAR PERFIL"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
