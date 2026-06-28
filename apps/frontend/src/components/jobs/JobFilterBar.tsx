"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const JobFilterBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ubicacion, setUbicacion] = useState(
    searchParams.get("ubicacion") || "",
  );
  const [empresa, setEmpresa] = useState(searchParams.get("empresa") || "");

  useEffect(() => {
    setUbicacion(searchParams.get("ubicacion") || "");
    setEmpresa(searchParams.get("empresa") || "");
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-sm text-gray-700">Filtros</h3>

      <label className="text-xs text-gray-500">Ubicación</label>
      <Input
        placeholder="Ej: Caracas"
        value={ubicacion}
        onChange={(e) => {
          setUbicacion(e.target.value);
          handleFilterChange("ubicacion", e.target.value);
        }}
      />

      <label className="text-xs text-gray-500">Empresa</label>
      <Input
        placeholder="Ej: Acme"
        value={empresa}
        onChange={(e) => {
          setEmpresa(e.target.value);
          handleFilterChange("empresa", e.target.value);
        }}
      />

      <Button variant="outline" onClick={() => router.push("/jobs")}>
        Limpiar filtros
      </Button>
    </div>
  );
};
