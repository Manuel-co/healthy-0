"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorForPatient } from "@/lib/patients-data";
import { getSessionsForPair, getCurrentSession, startSession, isSessionActive } from "@/lib/sessions-data";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Doctor, Patient, Session } from "@/lib/types";

export default function PatientMessagesPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  async function loadSessions(patientId: string, doctorId: string) {
    const [list, current] = await Promise.all([
      getSessionsForPair(patientId, doctorId),
      getCurrentSession(patientId, doctorId),
    ]);
    setSessions(list);
    setViewingSessionId(current?.id ?? null);
  }

  useEffect(() => {
    if (!user) return;
    getDoctorForPatient(user.id).then(async (d) => {
      if (!d) return;
      setDoctor(d);
      await loadSessions(user.id, d.id);
    });
  }, [user]);

  async function handleStartSession() {
    if (!user || !doctor) return;
    setStarting(true);
    setStartError(null);
    try {
      const session = await startSession(user.id, doctor.id);
      setSessions((prev) => [session, ...prev]);
      setViewingSessionId(session.id);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Couldn't start the session.");
    }
    setStarting(false);
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

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>

      {viewingSessionId ? (
        <div className="h-[70vh]">
          <ChatWindow
            sessionId={viewingSessionId}
            currentUserId={patient.id}
            otherPartyName={doctor.name}
            otherPartyAvatarUrl={doctor.profileImageUrl}
            onBack={() => setViewingSessionId(null)}
            onBookNext={handleStartSession}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start a session</CardTitle>
            <CardDescription>Begins a 30-minute chat window with {doctor.name}.</CardDescription>
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
  );
}
