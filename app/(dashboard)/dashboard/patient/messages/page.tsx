"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorForPatient } from "@/lib/patients-data";
import { getDoctorById } from "@/lib/doctors-data";
import {
  getSessionHistoryForPatient,
  getNextSession,
  startSession,
  joinSession,
  canJoinSession,
  cancelSession,
} from "@/lib/sessions-data";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { SessionStatusBadge } from "@/components/dashboard/SessionStatusBadge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OutOfSessionsNotice } from "@/components/dashboard/OutOfSessionsNotice";
import { getEntitlements, sessionsRemaining } from "@/lib/plans";
import { cn, formatSessionDate, formatSessionDuration } from "@/lib/utils";
import type { Doctor, Patient, Session } from "@/lib/types";

function MessagesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PatientMessagesPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyDoctors, setHistoryDoctors] = useState<Record<string, Doctor>>({});
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [sessionsLeft, setSessionsLeft] = useState<number | null>(null);

  async function loadSessions(patientId: string, doctorId: string) {
    const [historyList, next] = await Promise.all([
      getSessionHistoryForPatient(patientId),
      getNextSession(patientId, doctorId),
    ]);
    setHistory(historyList);
    setNextSession(next);
    setViewingSessionId(next?.status === "active" ? next.id : null);

    // A patient may have switched doctors — resolve every doctor their
    // history spans, not just the current one.
    const uniqueDoctorIds = Array.from(new Set(historyList.map((s) => s.doctorId)));
    const resolved = await Promise.all(uniqueDoctorIds.map((id) => getDoctorById(id)));
    setHistoryDoctors(
      Object.fromEntries(resolved.filter((d): d is Doctor => !!d).map((d) => [d.id, d]))
    );
  }

  useEffect(() => {
    if (!user) return;
    const patientUser = user as Patient;
    getDoctorForPatient(user.id).then(async (d) => {
      if (d) {
        setDoctor(d);
        await loadSessions(user.id, d.id);
      }
      setSessionsLeft(await sessionsRemaining(patientUser));
      setDataLoading(false);
    });
  }, [user]);

  async function handleStartSession() {
    if (!user || !doctor) return;
    setStarting(true);
    setStartError(null);
    try {
      const session = await startSession(user.id, doctor.id);
      setNextSession(session);
      setViewingSessionId(session.id);
      setSessionsLeft(await sessionsRemaining(user as Patient));
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't start the session.");
    }
    setStarting(false);
  }

  async function handleJoin() {
    if (!nextSession) return;
    setJoining(true);
    setStartError(null);
    try {
      const active = await joinSession(nextSession.id);
      setNextSession(active);
      setViewingSessionId(active.id);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't join the session.");
    }
    setJoining(false);
  }

  async function handleCancel() {
    if (!nextSession || !user || !doctor) return;
    setCancelling(true);
    setStartError(null);
    try {
      await cancelSession(nextSession.id, user.id);
      await loadSessions(user.id, doctor.id);
      setSessionsLeft(await sessionsRemaining(user as Patient));
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't cancel the session.");
    }
    setCancelling(false);
  }

  if (loading || !user) return null;
  const patient = user as Patient;

  if (patient.verificationStatus !== "verified") {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be able to message your doctor once your account is verified.
        </p>
      </div>
    );
  }

  if (dataLoading) return <MessagesSkeleton />;

  if (!doctor) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">You don&apos;t have an assigned doctor yet.</p>
          <Button asChild size="sm">
            <Link href="/dashboard/patient/doctors">Find a doctor</Link>
          </Button>
        </div>
      </div>
    );
  }

  // The session being viewed might be a past one with a DIFFERENT doctor
  // than the patient's current one, if they switched at some point.
  const viewingSession =
    history.find((s) => s.id === viewingSessionId) ?? (nextSession?.id === viewingSessionId ? nextSession : null);
  const viewingDoctor = (viewingSession && historyDoctors[viewingSession.doctorId]) ?? doctor;

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>

      {viewingSessionId ? (
        <div className="space-y-2">
          {startError && <p className="text-sm text-destructive">{startError}</p>}
          <div className="h-[75vh]">
            <ChatWindow
              sessionId={viewingSessionId}
              currentUserId={patient.id}
              otherPartyName={viewingDoctor.name}
              otherPartyAvatarUrl={viewingDoctor.profileImageUrl}
              onBack={() => setViewingSessionId(null)}
              onBookNext={handleStartSession}
            />
          </div>
        </div>
      ) : nextSession?.status === "scheduled" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming session</CardTitle>
            <CardDescription>
              {nextSession.scheduledFor &&
                new Date(nextSession.scheduledFor).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
              with {doctor.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {startError && <p className="text-sm text-destructive">{startError}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={joining || cancelling || !canJoinSession(nextSession)} onClick={handleJoin}>
                {joining ? "Joining..." : canJoinSession(nextSession) ? "Join session" : "Not yet time to join"}
              </Button>
              <Button size="sm" variant="outline" disabled={joining || cancelling} onClick={handleCancel}>
                {cancelling ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : sessionsLeft === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start a session</CardTitle>
          </CardHeader>
          <CardContent>
            <OutOfSessionsNotice />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start a session</CardTitle>
            <CardDescription>
              Begins a {getEntitlements(patient).sessionLengthMins}-minute chat window with {doctor.name}.
              {sessionsLeft !== null && ` ${sessionsLeft} of ${getEntitlements(patient).sessionsPerMonth} sessions left this month.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {startError && <p className="text-sm text-destructive">{startError}</p>}
            <Button size="sm" disabled={starting} onClick={handleStartSession}>
              {starting ? "Starting..." : "Start session"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past sessions yet.</p>
          ) : (
            history.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setViewingSessionId(s.id)}
                className={cn(
                  "flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-[#071938]/5",
                  viewingSessionId === s.id && "bg-[#071938]/[0.06]"
                )}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[#071938]">{formatSessionDate(s.endedAt, s.scheduledFor, s.startedAt)}</span>
                  <span className="text-xs text-muted-foreground">{historyDoctors[s.doctorId]?.name ?? "Doctor"}</span>
                  <span className="text-xs text-muted-foreground">{formatSessionDuration(s.startedAt, s.endedAt)}</span>
                </div>
                <SessionStatusBadge status={s.status} />
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
