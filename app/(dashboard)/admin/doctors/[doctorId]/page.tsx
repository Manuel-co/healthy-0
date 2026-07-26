"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorById, getPatientsForDoctor } from "@/lib/doctors-data";
import { PatientList } from "@/components/dashboard/PatientList";
import { VerificationActions } from "@/components/dashboard/VerificationActions";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Doctor, Patient } from "@/lib/types";

export default function AdminDoctorDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = use(params);
  const { user, loading } = useRequireRole("admin");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  const refresh = useCallback(() => {
    getDoctorById(doctorId).then((d) => setDoctor(d ?? null));
    getPatientsForDoctor(doctorId).then(setPatients);
  }, [doctorId]);

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user, refresh]);

  if (loading || !user) return null;
  if (!doctor) return <p className="text-sm text-muted-foreground">Doctor not found.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DoctorAvatar doctor={doctor} size="lg" />
            <CardTitle>{doctor.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Email: </span>{doctor.email}</p>
          <p><span className="text-muted-foreground">Specialty: </span>{doctor.specialty}</p>
          <p><span className="text-muted-foreground">License number: </span>{doctor.licenseNumber}</p>
          <p><span className="text-muted-foreground">Focus areas: </span>{doctor.focusAreas.join(", ") || "—"}</p>
          <p><span className="text-muted-foreground">Languages: </span>{doctor.languages.join(", ") || "—"}</p>
          <p><span className="text-muted-foreground">Experience: </span>{doctor.yearsExperience} yrs</p>
          <p><span className="text-muted-foreground">Accepting new patients: </span>{doctor.acceptingNewPatients ? "Yes" : "No"}</p>
          <p><span className="text-muted-foreground">Bio: </span>{doctor.bio || "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KYC submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">ID type: </span>{doctor.kyc.idType || "—"}</p>
          <p><span className="text-muted-foreground">ID number: </span>{doctor.kyc.idNumber || "—"}</p>
          <p><span className="text-muted-foreground">Document: </span>{doctor.kyc.documentName || "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientList patients={patients} basePath="/admin/patients" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review decision</CardTitle>
          <CardDescription>Approve this doctor to activate their account, or reject with a reason.</CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationActions
            userId={doctor.id}
            status={doctor.verificationStatus}
            banned={doctor.banned}
            rejectionReason={doctor.rejectionReason}
            onChange={refresh}
          />
        </CardContent>
      </Card>
    </div>
  );
}
