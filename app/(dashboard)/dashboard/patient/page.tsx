"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorForPatient } from "@/lib/patients-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import type { Doctor, Patient } from "@/lib/types";

export default function PatientDashboardPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoctorForPatient(user.id).then((d) => setDoctor(d ?? null));
  }, [user]);

  if (loading || !user) return null;
  const patient = user as Patient;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Welcome, {patient.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s an overview of your care.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name: </span>{patient.name}</p>
            <p><span className="text-muted-foreground">Email: </span>{patient.email}</p>
            <p><span className="text-muted-foreground">Date of birth: </span>{patient.dob}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My doctor</CardTitle>
            <CardDescription>{doctor ? doctor.specialty : "Not yet assigned"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {doctor ? (
              <>
                <div className="flex items-center gap-2.5">
                  <DoctorAvatar doctor={doctor} />
                  <p className="font-medium text-[#071938]">{doctor.name}</p>
                </div>
                <Button asChild size="sm">
                  <Link href="/dashboard/patient/messages">Message {doctor.name.split(" ")[0]}</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">You don&apos;t have a doctor yet.</p>
                <Button asChild size="sm">
                  <Link href="/dashboard/patient/doctors">Find a doctor</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
