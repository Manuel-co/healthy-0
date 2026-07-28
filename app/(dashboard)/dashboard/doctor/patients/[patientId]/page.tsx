"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPatientById } from "@/lib/patients-data";
import { getAssignmentForPair, acceptAssignment, declineAssignment } from "@/lib/assignments";
import { getSessionsForPair, getCurrentSession, startSession, isSessionActive } from "@/lib/sessions-data";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateAge, cn } from "@/lib/utils";
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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const loadSessions = useCallback(
    async (doctorId: string) => {
      const [list, current] = await Promise.all([
        getSessionsForPair(patientId, doctorId),
        getCurrentSession(patientId, doctorId),
      ]);
      setSessions(list);
      setViewingSessionId(current?.id ?? null);
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
      setSessions((prev) => [session, ...prev]);
      setViewingSessionId(session.id);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't start the session.");
    }
    setStarting(false);
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

            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setViewingSessionId(s.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-[#071938]/5",
                        viewingSessionId === s.id && "bg-[#071938]/[0.06]"
                      )}
                    >
                      <span className="text-[#071938]">
                        {new Date(s.startedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-muted-foreground">{isSessionActive(s) ? "Active" : "Ended"}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ))}

      {assignment?.status !== "requested" && assignment?.status !== "active" && (
        <p className="text-sm text-muted-foreground">No active care relationship with this patient.</p>
      )}
    </div>
  );
}
