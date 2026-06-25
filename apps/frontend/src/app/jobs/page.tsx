"use client";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function JobsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Vacantes</h1>
        <p className="text-gray-500">
          Próximamente: listado de vacantes con filtros.
        </p>
      </div>
    </DashboardLayout>
  );
}
