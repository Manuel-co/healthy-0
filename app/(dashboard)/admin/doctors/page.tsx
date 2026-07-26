"use client";

import { useEffect, useState } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getAllDoctors, getPatientsForDoctor } from "@/lib/doctors-data";
import { DoctorList } from "@/components/dashboard/DoctorList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/lib/types";

export default function AdminDoctorsPage() {
  const { user, loading } = useRequireRole("admin");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientCounts, setPatientCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    getAllDoctors().then(async (allDoctors) => {
      setDoctors(allDoctors);
      const counts = await Promise.all(
        allDoctors.map(async (doctor) => [doctor.id, (await getPatientsForDoctor(doctor.id)).length] as const)
      );
      setPatientCounts(Object.fromEntries(counts));
    });
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Doctors</h1>
      <Card>
        <CardHeader>
          <CardTitle>All doctors ({doctors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorList doctors={doctors} basePath="/admin/doctors" patientCounts={patientCounts} />
        </CardContent>
      </Card>
    </div>
  );
}
