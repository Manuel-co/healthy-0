"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Wallet, Stethoscope, ChevronRight, Video, HeartPulse, Search, MessageSquare } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorForPatient } from "@/lib/patients-data";
import {
  getSessionsForPair,
  canJoinSession,
  isSessionActive,
  cancelSession,
  ensureUpcomingSessionReminders,
} from "@/lib/sessions-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GeneratedAvatarFallback } from "@/components/ui/generated-avatar";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import { BookSessionDialog } from "@/components/dashboard/BookSessionDialog";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";
import { OutOfSessionsNotice } from "@/components/dashboard/OutOfSessionsNotice";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 pt-2">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  href: string;
}) {
  return (
    <Card>
      <CardContent className="pt-2">
        <Link href={href} className="flex items-start justify-between gap-2" aria-label={`View ${label.toLowerCase()}`}>
          <div className="space-y-2">
            <div className={`flex size-9 items-center justify-center rounded-xl text-[#071938] ${iconBg}`}>{icon}</div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-heading text-lg font-bold text-[#071938]">{value}</p>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-[#071938]/30" />
        </Link>
      </CardContent>
    </Card>
  );
}

function formatSessionTime(session: Session): string {
  const timestamp = session.scheduledFor ?? session.startedAt;
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PatientDashboardPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patientOverride, setPatientOverride] = useState<Patient | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sessionsLeft, setSessionsLeft] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async (patientId: string, doctorId: string) => {
    const [pairSessions, left] = await Promise.all([
      getSessionsForPair(patientId, doctorId),
      sessionsRemaining((patientOverride as Patient) ?? (user as Patient)),
    ]);
    setSessions(pairSessions);
    setSessionsLeft(left);
  }, [user, patientOverride]);

  useEffect(() => {
    if (!user) return;
    const patientUser = user as Patient;
    getDoctorForPatient(user.id).then(async (d) => {
      setDoctor(d ?? null);
      if (d) {
        const [pairSessions] = await Promise.all([
          getSessionsForPair(user.id, d.id),
          ensureUpcomingSessionReminders(user.id, d.id),
        ]);
        setSessions(pairSessions);
      }
      setSessionsLeft(await sessionsRemaining(patientUser));
      setDataLoading(false);
    });
  }, [user]);

  if (loading || !user) return null;
  if (dataLoading) return <DashboardSkeleton />;
  const patient = patientOverride ?? (user as Patient);
  const entitlements = getEntitlements(patient);

  const upcoming = sessions
    .filter((s) => s.status === "scheduled" || s.status === "active")
    .sort((a, b) => (a.scheduledFor ?? a.startedAt ?? "").localeCompare(b.scheduledFor ?? b.startedAt ?? ""));
  const hasSessionToday = upcoming.some((s) => {
    const t = s.scheduledFor ?? s.startedAt;
    return t && new Date(t).toDateString() === new Date().toDateString();
  });

  async function handleBooked(session: Session) {
    setSessions((prev) => [...prev, session]);
    setSessionsLeft(await sessionsRemaining(patient));
  }

  async function handleCancel(sessionId: string) {
    setCancelingId(sessionId);
    setActionError(null);
    try {
      await cancelSession(sessionId, patient.id);
      if (doctor) await refresh(patient.id, doctor.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't cancel that session.");
    }
    setCancelingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Welcome, {patient.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">
          {upcoming.some((s) => s.status === "active")
            ? "You have a session live right now."
            : hasSessionToday
              ? "You have an appointment today."
              : "You have no appointments today."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CalendarDays className="size-4.5" />}
          iconBg="bg-[#e7f1a8]/60"
          label="Sessions this month"
          value={sessionsLeft !== null ? `${sessionsLeft} of ${entitlements.sessionsPerMonth} left` : "—"}
          href="/dashboard/patient/messages"
        />
        <StatCard
          icon={<Wallet className="size-4.5" />}
          iconBg="bg-[#cfe0f7]/70"
          label="Current plan"
          value={entitlements.name}
          href="/dashboard/patient/plan"
        />
        <StatCard
          icon={<Stethoscope className="size-4.5" />}
          iconBg="bg-[#071938]/8"
          label="Your doctor"
          value={doctor ? doctor.name : "Unassigned"}
          href="/dashboard/patient/doctors"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Upcoming appointments</CardTitle>
                {doctor && sessionsLeft !== 0 && (
                  <BookSessionDialog
                    patientId={patient.id}
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    sessionLengthMins={entitlements.sessionLengthMins}
                    onBooked={handleBooked}
                    trigger={
                      <Button size="sm" variant="outline" className="rounded-full">
                        Book a session
                      </Button>
                    }
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
              {!doctor ? (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Find a doctor to get started.</p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/patient/doctors">Find a doctor</Link>
                  </Button>
                </div>
              ) : sessionsLeft === 0 && upcoming.length === 0 ? (
                <OutOfSessionsNotice />
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              ) : (
                upcoming.map((session, i) => {
                  const isNext = i === 0;
                  const joinable = isSessionActive(session) || canJoinSession(session);
                  return (
                    <div
                      key={session.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 ${
                        isNext ? "bg-[#e7f1a8]/25" : "border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-sm">
                        <DoctorAvatar doctor={doctor} size="sm" />
                        <div>
                          <p className="font-medium text-[#071938]">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{formatSessionTime(session)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {joinable ? (
                          <Button asChild size="sm" className="rounded-full">
                            <Link href="/dashboard/patient/messages">
                              <Video className="size-3.5" />
                              Join Session
                            </Link>
                          </Button>
                        ) : session.status === "scheduled" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={cancelingId === session.id}
                            onClick={() => handleCancel(session.id)}
                          >
                            {cancelingId === session.id ? "Cancelling..." : "Cancel appointment"}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">
                  <GeneratedAvatarFallback seed={patient.id} size="lg" />
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-heading font-bold text-[#071938]">{patient.name}</p>
              <p className="text-xs text-muted-foreground">{calculateAge(patient.dob)} years</p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border py-3 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">Language</p>
                <p className="text-sm font-semibold text-[#071938]">{patient.intake?.preferredLanguage ?? "—"}</p>
              </div>
              <div className="border-x border-border">
                <p className="text-[10px] text-muted-foreground">Urgency</p>
                <p className="text-sm font-semibold capitalize text-[#071938]">{patient.intake?.urgency ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Member since</p>
                <p className="text-sm font-semibold text-[#071938]">{new Date(patient.createdAt).getFullYear()}</p>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-[#071938]">
                <HeartPulse className="size-3.5 text-[#0040b2]" />
                Care details
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• {patient.presentingConcern || "Reason for care not shared yet."}</li>
                <li>
                  •{" "}
                  {patient.intake?.focusAreas.length
                    ? `Focus areas: ${patient.intake.focusAreas.join(", ")}`
                    : "Focus areas not shared yet."}
                </li>
              </ul>
            </div>

            <EditProfileDialog
              patient={patient}
              onSaved={setPatientOverride}
              trigger={
                <Button size="sm" variant="outline" className="w-full rounded-full">
                  Edit profile
                </Button>
              }
            />

            <div className="-mx-6 border-t border-border">
              <Link
                href="/dashboard/patient/plan"
                className="flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-[#071938] hover:bg-muted/50"
              >
                <Wallet className="size-4 text-[#0040b2]" />
                My Plan
                <ChevronRight className="ml-auto size-4 text-[#071938]/40" />
              </Link>
              <Link
                href="/dashboard/patient/doctors"
                className="flex items-center gap-2.5 border-t border-border px-6 py-3 text-sm font-medium text-[#071938] hover:bg-muted/50"
              >
                <Search className="size-4 text-[#0040b2]" />
                Update matching info
                <ChevronRight className="ml-auto size-4 text-[#071938]/40" />
              </Link>
              <Link
                href="/dashboard/patient/messages"
                className="flex items-center gap-2.5 border-t border-border px-6 py-3 text-sm font-medium text-[#071938] hover:bg-muted/50"
              >
                <MessageSquare className="size-4 text-[#0040b2]" />
                Messages
                <ChevronRight className="ml-auto size-4 text-[#071938]/40" />
              </Link>
            </div>

            {!entitlements.canChooseDoctor && (
              <div className="rounded-xl bg-[#071938] p-4">
                <p className="font-heading text-sm text-white">Want to choose your own doctor?</p>
                <p className="mt-1 text-xs text-white/60">Upgrade to Pro or Max for full control over your care team.</p>
                <Button asChild size="sm" className="mt-3 rounded-full bg-[#e7f1a8] text-[#071938] hover:bg-[#e7f1a8]/90">
                  <Link href="/dashboard/patient/plan">Upgrade plan</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
