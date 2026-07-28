"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, MessageSquare, Search } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getPatientById } from "@/lib/patients-data";
import { getSessionsForDoctor, startSession } from "@/lib/sessions-data";
import { getLastMessage, getUnreadCountForSession, messagePreviewText } from "@/lib/messaging";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { ConversationListItem } from "@/components/messaging/ConversationListItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Doctor, Message, Patient, Session } from "@/lib/types";

interface SessionRow {
  session: Session;
  patient: Patient;
  lastMessage: Message | null;
  unreadCount: number;
}

function PendingPatientNotice({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white p-6 text-center">
      <AlertCircle className="size-8 text-[#071938]/30" />
      <p className="text-sm text-muted-foreground">
        {name}&apos;s account is pending admin verification. Messaging opens up once they&apos;re approved.
      </p>
    </div>
  );
}

function InboxRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="size-10 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-3 w-40 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function DoctorMessagesPage() {
  const { user, loading } = useRequireRole("doctor");
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  async function loadRows(doctorId: string): Promise<SessionRow[]> {
    const sessions = await getSessionsForDoctor(doctorId);
    const built = await Promise.all(
      sessions.map(async (session): Promise<SessionRow | null> => {
        const patient = await getPatientById(session.patientId);
        if (!patient) return null;
        const [lastMessage, unreadCount] = await Promise.all([
          getLastMessage(session.id),
          getUnreadCountForSession(session.id, doctorId),
        ]);
        return { session, patient, lastMessage, unreadCount };
      })
    );
    return built.filter((r): r is SessionRow => r !== null);
  }

  async function refresh() {
    if (!user) return;
    setRows(await loadRows(user.id));
  }

  useEffect(() => {
    if (!user) return;
    loadRows(user.id).then((result) => {
      setRows(result);
      setInboxLoading(false);
    });
  }, [user]);

  const filteredRows = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => r.patient.name.toLowerCase().includes(query));
  }, [rows, debouncedSearch]);

  const selected = rows.find((r) => r.session.id === selectedSessionId) ?? null;

  async function handleBookNext(patientId: string) {
    if (!user) return;
    const session = await startSession(patientId, user.id);
    await refresh();
    setSelectedSessionId(session.id);
  }

  if (loading || !user) return null;
  const doctor = user as Doctor;

  if (doctor.verificationStatus !== "verified") {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be able to message patients once your account is verified.
        </p>
      </div>
    );
  }

  const list = (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-border p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search patients"
          className="pl-8"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {inboxLoading ? (
          Array.from({ length: 4 }).map((_, i) => <InboxRowSkeleton key={i} />)
        ) : filteredRows.length === 0 ? (
          <div className="space-y-2 p-4 text-center">
            <p className="text-sm text-muted-foreground">No sessions match your search.</p>
            <Button size="sm" variant="outline" onClick={() => setSearchInput("")}>
              Clear search
            </Button>
          </div>
        ) : (
          filteredRows.map((r) => (
            <ConversationListItem
              key={r.session.id}
              name={r.patient.name}
              avatarUrl={null}
              subtitle={
                r.patient.verificationStatus !== "verified"
                  ? "Pending verification"
                  : r.session.status === "active"
                    ? "Active session"
                    : r.lastMessage
                      ? messagePreviewText(r.lastMessage)
                      : "No messages yet"
              }
              lastMessageAt={r.lastMessage?.createdAt}
              unreadCount={r.unreadCount}
              isEmpty={!r.lastMessage}
              isActive={r.session.id === selectedSessionId}
              onClick={() => setSelectedSessionId(r.session.id)}
            />
          ))
        )}
      </div>
    </div>
  );

  if (!inboxLoading && rows.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <p className="text-sm text-muted-foreground">
          No sessions yet — start one from a patient&apos;s profile and it&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>

      {/* Mobile: list, or full-screen chat once a session is selected */}
      <div className="h-[75vh] md:hidden">
        {selected ? (
          selected.patient.verificationStatus === "verified" ? (
            <ChatWindow
              sessionId={selected.session.id}
              currentUserId={doctor.id}
              otherPartyName={selected.patient.name}
              onBack={() => setSelectedSessionId(null)}
              onRead={refresh}
              onBookNext={() => handleBookNext(selected.patient.id)}
            />
          ) : (
            <PendingPatientNotice name={selected.patient.name} />
          )
        ) : (
          <div className="h-full rounded-xl border border-border bg-white">{list}</div>
        )}
      </div>

      {/* Desktop: two-pane inbox */}
      <div className="hidden h-[75vh] gap-4 md:flex">
        <div className="w-80 shrink-0 rounded-xl border border-border bg-white">{list}</div>
        <div className="flex-1">
          {selected ? (
            selected.patient.verificationStatus === "verified" ? (
              <ChatWindow
                sessionId={selected.session.id}
                currentUserId={doctor.id}
                otherPartyName={selected.patient.name}
                onRead={refresh}
                onBookNext={() => handleBookNext(selected.patient.id)}
              />
            ) : (
              <PendingPatientNotice name={selected.patient.name} />
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white text-center">
              <MessageSquare className="size-8 text-[#071938]/30" />
              <p className="text-sm text-muted-foreground">Select a session to start reading.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
