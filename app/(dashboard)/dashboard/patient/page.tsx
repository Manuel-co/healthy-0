"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorForPatient } from "@/lib/patients-data";
import { getNextSession, canJoinSession, ensureUpcomingSessionReminders } from "@/lib/sessions-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import { BookSessionDialog } from "@/components/dashboard/BookSessionDialog";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";
import { OutOfSessionsNotice } from "@/components/dashboard/OutOfSessionsNotice";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getEntitlements, sessionsRemaining } from "@/lib/plans";
import { calculateAge } from "@/lib/utils";
import type { Doctor, Patient, Session } from "@/lib/types";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PatientDashboardPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [patientOverride, setPatientOverride] = useState<Patient | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sessionsLeft, setSessionsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const patientUser = user as Patient;
    getDoctorForPatient(user.id).then(async (d) => {
      setDoctor(d ?? null);
      if (d) {
        setNextSession(await getNextSession(user.id, d.id));
        await ensureUpcomingSessionReminders(user.id, d.id);
      }
      setSessionsLeft(await sessionsRemaining(patientUser));
      setDataLoading(false);
    });
  }, [user]);

  if (loading || !user) return null;
  if (dataLoading) return <DashboardSkeleton />;
  const patient = patientOverride ?? (user as Patient);
  const entitlements = getEntitlements(patient);

  async function handleBooked(session: Session) {
    setNextSession(session);
    setSessionsLeft(await sessionsRemaining(patient));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Welcome, {patient.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s an overview of your care.</p>
        </div>
        <Badge variant="outline">{entitlements.name} plan</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next session</CardTitle>
            {sessionsLeft !== null && (
              <CardDescription>
                {sessionsLeft} of {entitlements.sessionsPerMonth} sessions left this month
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!doctor ? (
              <p className="text-muted-foreground">Find a doctor to get started.</p>
            ) : nextSession?.status === "active" ? (
              <>
                <p className="text-[#071938]">Live now with {doctor.name}</p>
                <Button asChild size="sm">
                  <Link href="/dashboard/patient/messages">Join</Link>
                </Button>
              </>
            ) : nextSession?.status === "scheduled" ? (
              <>
                <p className="text-[#071938]">
                  {nextSession.scheduledFor &&
                    new Date(nextSession.scheduledFor).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                  with {doctor.name}
                </p>
                {canJoinSession(nextSession) ? (
                  <Button asChild size="sm">
                    <Link href="/dashboard/patient/messages">Join</Link>
                  </Button>
                ) : (
                  <Button size="sm" disabled>
                    Not yet time to join
                  </Button>
                )}
              </>
            ) : sessionsLeft === 0 ? (
              <OutOfSessionsNotice />
            ) : (
              <>
                <p className="text-muted-foreground">No upcoming session.</p>
                <div className="flex flex-wrap gap-2">
                  <BookSessionDialog
                    patientId={patient.id}
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    sessionLengthMins={entitlements.sessionLengthMins}
                    onBooked={handleBooked}
                    trigger={<Button size="sm">Book a session</Button>}
                  />
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/patient/messages">Start now</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {doctor ? (
          <Card>
            <CardHeader>
              <CardTitle>My doctor</CardTitle>
              <CardDescription>{doctor.specialty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5">
                <DoctorAvatar doctor={doctor} />
                <p className="font-medium text-[#071938]">{doctor.name}</p>
              </div>
              {doctor.focusAreas.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Focus areas: </span>
                  {doctor.focusAreas.join(", ")}
                </p>
              )}
              {doctor.languages.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Languages: </span>
                  {doctor.languages.join(", ")}
                </p>
              )}
              {doctor.bio && <p className="text-muted-foreground">{doctor.bio}</p>}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/patient/messages">Message {doctor.name}</Link>
                </Button>
                {sessionsLeft !== 0 && (
                  <BookSessionDialog
                    patientId={patient.id}
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    sessionLengthMins={entitlements.sessionLengthMins}
                    onBooked={handleBooked}
                    trigger={
                      <Button size="sm" variant="outline">
                        Book
                      </Button>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Find your doctor</CardTitle>
              <CardDescription>Browse verified doctors and request the one that fits you best.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href="/dashboard/patient/doctors">Find a doctor</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>My profile</CardTitle>
            <EditProfileDialog
              patient={patient}
              onSaved={setPatientOverride}
              trigger={
                <Button size="sm" variant="outline">
                  Edit profile
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {patient.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {patient.email}
          </p>
          <p>
            <span className="text-muted-foreground">Date of birth: </span>
            {patient.dob} <span className="text-[#071938]/40">({calculateAge(patient.dob)})</span>
          </p>
          <p>
            <span className="text-muted-foreground">Reason for care: </span>
            {patient.presentingConcern || <span className="text-[#071938]/40">Not shared yet</span>}
          </p>
          <p>
            <span className="text-muted-foreground">Focus areas: </span>
            {patient.intake?.focusAreas.length ? (
              patient.intake.focusAreas.join(", ")
            ) : (
              <span className="text-[#071938]/40">Not shared yet</span>
            )}
          </p>
          <p>
            <span className="text-muted-foreground">Preferred language: </span>
            {patient.intake?.preferredLanguage ?? <span className="text-[#071938]/40">No preference</span>}
          </p>
          <Button asChild size="sm" variant="outline" className="mt-2">
            <Link href="/dashboard/patient/doctors">Update matching info</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
