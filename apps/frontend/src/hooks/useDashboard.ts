"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export interface Profile {
  id: number;
  resumen_profesional?: string;
  semestre?: number;
  modalidad_preferida?: string;
  github_url?: string;
  linkedin_url?: string;
  user: { nombre: string; apellido: string; email: string; rol: string; avatar?: string; }
}

export interface StudentSkill {
  id: number;
  skill: { nombre: string };
  nivel: string;
}

export function useDashboard() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setErrors({});

      const [profileRes, skillsRes] = await Promise.allSettled([
        api.get<Profile>("/profiles/me", token),
        api.get<StudentSkill[]>("/student-skills/me", token),
      ]);

      if (profileRes.status == "fulfilled") setProfile(profileRes.value);
      else setErrors((e) => ({ ...e, profile: "Error al cargar perfil" }));

      if (skillsRes.status == "fulfilled") setSkills(skillsRes.value);
      else setErrors((e) => ({ ...e, skills: "Error al cargar skills" }));

      setLoading(false);
    };

    fetchData();
  }, [token]);

  return {
    user,
    profile,
    skills,
    loading,
    errors,
  };
}