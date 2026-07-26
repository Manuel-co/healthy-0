"use client";

import { useEffect, useState } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getAllPatients } from "@/lib/patients-data";
import { PatientList } from "@/components/dashboard/PatientList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Patient } from "@/lib/types";

export default function AdminPatientsPage() {
  const { user, loading } = useRequireRole("admin");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!user) return;
    getAllPatients().then(setPatients);
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Patients</h1>
      <Card>
        <CardHeader>
          <CardTitle>All patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientList patients={patients} basePath="/admin/patients" />
        </CardContent>
      </Card>
    </div>
  );
}
