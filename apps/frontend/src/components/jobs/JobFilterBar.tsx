"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Building2 } from "lucide-react";

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
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted">
      <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Filtros</h3>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Ubicación"
          value={ubicacion}
          onChange={(e) => {
            setUbicacion(e.target.value);
            handleFilterChange("ubicacion", e.target.value);
          }}
          className="h-8 pl-7 text-xs"
        />
      </div>

      <div className="relative">
        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Empresa"
          value={empresa}
          onChange={(e) => {
            setEmpresa(e.target.value);
            handleFilterChange("empresa", e.target.value);
          }}
          className="h-8 pl-7 text-xs"
        />
      </div>

      <Button variant="outline" size="sm" onClick={() => router.push("/jobs")}>
        Limpiar
      </Button>
    </div>
  );
};
