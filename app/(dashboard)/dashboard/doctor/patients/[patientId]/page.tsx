"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPatientById } from "@/lib/patients-data";
import { getAssignmentForPair, acceptAssignment, declineAssignment } from "@/lib/assignments";
import {
  getSessionHistory,
  getNextSession,
  startSession,
  joinSession,
  canJoinSession,
  cancelSession,
} from "@/lib/sessions-data";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SessionStatusBadge } from "@/components/dashboard/SessionStatusBadge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateAge, cn, formatSessionDate, formatSessionDuration } from "@/lib/utils";
import type { Assignment, Doctor, Patient, Session } from "@/lib/types";

export default function DoctorPatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const { user, loading } = useRequireRole("doctor");
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const loadSessions = useCallback(
    async (doctorId: string) => {
      const [historyList, next] = await Promise.all([
        getSessionHistory(patientId, doctorId),
        getNextSession(patientId, doctorId),
      ]);
      setHistory(historyList);
      setNextSession(next);
      // Scheduled-but-not-started sessions get their own "Upcoming" card, not the chat.
      setViewingSessionId(next?.status === "active" ? next.id : null);
    },
    [patientId]
  );

  useEffect(() => {
    if (!user) return;
    getPatientById(patientId).then(async (p) => {
      if (!p) return;
      setPatient(p);
      const relevantAssignment = await getAssignmentForPair(patientId, user.id);
      setAssignment(relevantAssignment);
      if (relevantAssignment?.status === "active") {
        await loadSessions(user.id);
      }
    });
  }, [user, patientId, loadSessions]);

  async function handleAccept() {
    if (!assignment || !user) return;
    setActing(true);
    const active = await acceptAssignment(assignment.id);
    setAssignment(active);
    if (active) await loadSessions(user.id);
    setActing(false);
  }

  async function handleDecline() {
    if (!assignment) return;
    setActing(true);
    await declineAssignment(assignment.id);
    router.push("/dashboard/doctor");
  }

  async function handleStartSession() {
    if (!user) return;
    setStarting(true);
    setStartError(null);
    try {
      const session = await startSession(patientId, user.id);
      setNextSession(session);
      setViewingSessionId(session.id);
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
    if (!nextSession || !user) return;
    setCancelling(true);
    setStartError(null);
    try {
      await cancelSession(nextSession.id, user.id);
      await loadSessions(user.id);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't cancel the session.");
    }
    setCancelling(false);
  }

  if (loading || !user) return null;
  if (!patient) return <p className="text-sm text-muted-foreground">Patient not found.</p>;
  const doctor = user as Doctor;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {patient.name}
            <StatusBadge status={patient.verificationStatus} banned={patient.banned} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Date of birth: </span>
            {patient.dob} <span className="text-[#071938]/40">({calculateAge(patient.dob)})</span>
          </p>
          <p>
            <span className="text-muted-foreground">Reason for care: </span>
            {patient.presentingConcern || <span className="text-[#071938]/40">Not shared yet</span>}
          </p>
        </CardContent>
      </Card>

      {assignment?.status === "requested" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incoming request</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button size="sm" disabled={acting} onClick={handleAccept}>
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={acting} onClick={handleDecline}>
              Decline
            </Button>
          </CardContent>
        </Card>
      )}

      {assignment?.status === "active" &&
        (doctor.verificationStatus !== "verified" ? (
          <p className="text-sm text-muted-foreground">
            You&apos;ll be able to message patients once your account is verified.
          </p>
        ) : patient.verificationStatus !== "verified" ? (
          <p className="text-sm text-muted-foreground">
            {patient.name}&apos;s account is still pending admin verification — messaging opens up once they&apos;re
            approved.
          </p>
        ) : (
          <div className="space-y-4">
            {viewingSessionId ? (
              <div className="h-[70vh]">
                <ChatWindow
                  sessionId={viewingSessionId}
                  currentUserId={doctor.id}
                  otherPartyName={patient.name}
                  onBack={() => setViewingSessionId(null)}
                  onBookNext={handleStartSession}
                />
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
                    with {patient.name}
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Start a session</CardTitle>
                  <CardDescription>Begins a 30-minute chat window with {patient.name}.</CardDescription>
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
                        <span className="text-xs text-muted-foreground">{formatSessionDuration(s.startedAt, s.endedAt)}</span>
                      </div>
                      <SessionStatusBadge status={s.status} />
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}

      {assignment?.status !== "requested" && assignment?.status !== "active" && (
        <p className="text-sm text-muted-foreground">No active care relationship with this patient.</p>
      )}
    </div>
  );
}
