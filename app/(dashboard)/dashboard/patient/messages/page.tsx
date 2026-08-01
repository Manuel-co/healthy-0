"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MessageSquare } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
import { getEntitlements, sessionsRemaining } from "@/lib/plans";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { InboxLayout } from "@/components/messaging/InboxLayout";
import { SessionListItem } from "@/components/messaging/SessionListItem";
import { OutOfSessionsNotice } from "@/components/dashboard/OutOfSessionsNotice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doctor, Patient, Session } from "@/lib/types";

interface SessionRow {
  session: Session;
  doctor: Doctor;
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
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250);

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

  const rows: SessionRow[] = useMemo(() => {
    const activeRow: SessionRow[] = nextSession?.status === "active" && doctor ? [{ session: nextSession, doctor }] : [];
    const historyRows: SessionRow[] = history.flatMap((s) => {
      const d = historyDoctors[s.doctorId];
      return d ? [{ session: s, doctor: d }] : [];
    });
    return [...activeRow, ...historyRows];
  }, [nextSession, doctor, history, historyDoctors]);

  const filteredRows = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => r.doctor.name.toLowerCase().includes(query));
  }, [rows, debouncedSearch]);

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

  if (dataLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="flex h-[75vh] gap-4">
          <div className="w-full shrink-0 space-y-3 rounded-xl border border-border bg-white p-3 md:w-80">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <div className="hidden flex-1 rounded-xl border border-border bg-white md:block" />
        </div>
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

  const entitlements = getEntitlements(patient);

  const topAction =
    nextSession?.status === "scheduled" ? (
      <Card className="border-none bg-[#f2f1e8] shadow-none">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm">Upcoming session</CardTitle>
          <CardDescription className="text-xs">
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
        <CardContent className="space-y-2 p-3 pt-2">
          {startError && <p className="text-xs text-destructive">{startError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={joining || cancelling || !canJoinSession(nextSession)} onClick={handleJoin}>
              {joining ? "Joining..." : canJoinSession(nextSession) ? "Join session" : "Not yet time"}
            </Button>
            <Button size="sm" variant="outline" disabled={joining || cancelling} onClick={handleCancel}>
              {cancelling ? "Cancelling..." : "Cancel"}
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : nextSession?.status === "active" ? (
      <Card className="border-none bg-[#f2f1e8] shadow-none">
        <CardContent className="p-3 text-sm text-[#071938]">Live now with {doctor.name}.</CardContent>
      </Card>
    ) : sessionsLeft === 0 ? (
      <Card className="border-none bg-[#f2f1e8] shadow-none">
        <CardContent className="p-3">
          <OutOfSessionsNotice />
        </CardContent>
      </Card>
    ) : (
      <Card className="border-none bg-[#f2f1e8] shadow-none">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm">Start a session</CardTitle>
          <CardDescription className="text-xs">
            Begins a {entitlements.sessionLengthMins}-minute chat window with {doctor.name}.
            {sessionsLeft !== null && ` ${sessionsLeft} of ${entitlements.sessionsPerMonth} left this month.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-2">
          {startError && <p className="text-xs text-destructive">{startError}</p>}
          <Button size="sm" disabled={starting} onClick={handleStartSession}>
            {starting ? "Starting..." : "Start session"}
          </Button>
        </CardContent>
      </Card>
    );

  const list = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="space-y-3 border-b border-border p-3">
        {topAction}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search history"
            aria-label="Search session history"
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredRows.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? "No sessions yet." : "No sessions match your search."}
          </p>
        ) : (
          filteredRows.map((r) => (
            <SessionListItem
              key={r.session.id}
              session={r.session}
              doctorName={r.doctor.name}
              isActive={viewingSessionId === r.session.id}
              onClick={() => setViewingSessionId(r.session.id)}
            />
          ))
        )}
      </div>
    </div>
  );

  const viewingRow = rows.find((r) => r.session.id === viewingSessionId) ?? null;

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>

      <InboxLayout
        list={list}
        hasSelection={!!viewingRow}
        onDeselect={() => setViewingSessionId(null)}
        renderDetail={(onBack) =>
          viewingRow ? (
            <ChatWindow
              sessionId={viewingRow.session.id}
              currentUserId={patient.id}
              otherPartyName={viewingRow.doctor.name}
              otherPartyAvatarUrl={viewingRow.doctor.profileImageUrl}
              onBack={onBack}
              onBookNext={handleStartSession}
            />
          ) : null
        }
        emptyState={
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white text-center">
            <MessageSquare className="size-8 text-[#071938]/30" />
            <p className="text-sm text-muted-foreground">Select a session to read.</p>
          </div>
        }
      />
    </div>
  );
}
