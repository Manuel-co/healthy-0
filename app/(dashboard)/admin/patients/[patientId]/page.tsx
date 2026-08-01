"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPatientById, getDoctorForPatient } from "@/lib/patients-data";
import { VerificationActions } from "@/components/dashboard/VerificationActions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Doctor, Patient } from "@/lib/types";

export default function AdminPatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const { user, loading } = useRequireRole("admin");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const refresh = useCallback(() => {
    getPatientById(patientId).then((p) => setPatient(p ?? null));
    getDoctorForPatient(patientId).then((d) => setDoctor(d ?? null));
  }, [patientId]);

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user, refresh]);

  if (loading || !user) return null;
  if (!patient) return <p className="text-sm text-muted-foreground">Patient not found.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{patient.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Email: </span>{patient.email}</p>
          <p><span className="text-muted-foreground">Date of birth: </span>{patient.dob}</p>
          <p><span className="text-muted-foreground">Assigned doctor: </span>{doctor ? doctor.name : "Unassigned"}</p>
          {patient.intake && (
            <p>
              <span className="text-muted-foreground">Focus areas: </span>
              {patient.intake.focusAreas.join(", ") || "—"}
            </p>
          )}
        </CardContent>
      </Card>

      {patient.unmatchedFlag && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="text-amber-800">Needs review — no exact match</CardTitle>
            <CardDescription>
              Flagged {new Date(patient.unmatchedFlag.flaggedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-amber-800">{patient.unmatchedFlag.reason}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Review decision</CardTitle>
          <CardDescription>Approve this patient to activate their account, or reject with a reason.</CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationActions
            userId={patient.id}
            status={patient.verificationStatus}
            banned={patient.banned}
            rejectionReason={patient.rejectionReason}
            onChange={refresh}
          />
        </CardContent>
      </Card>
    </div>
  );
}
