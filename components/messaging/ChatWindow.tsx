"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, Video } from "lucide-react";
import { getMessages, sendMessage, markSessionRead } from "@/lib/messaging";
import { getSessionById, isSessionActive, msRemaining, extendSession } from "@/lib/sessions-data";
import { getPatientById } from "@/lib/patients-data";
import { getEntitlements, type PlanConfig } from "@/lib/plans";
import { PLAN_PATH } from "@/lib/routes";
import { usePolling } from "@/hooks/usePolling";
import { MessageInput } from "@/components/messaging/MessageInput";
import { VideoCallDialog } from "@/components/messaging/VideoCallDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, initials, formatCountdown, formatRelativeTimestamp } from "@/lib/utils";
import type { Message, MessageAttachment, Session } from "@/lib/types";

const POLL_INTERVAL_MS = 4000;
const WARNING_THRESHOLD_MS = 5 * 60 * 1000;

const ENDED_LABELS: Partial<Record<Session["status"], string>> = {
  completed: "Session ended",
  cancelled: "Session cancelled",
  "no-show": "Marked as no-show",
  scheduled: "Session not started yet",
};

interface ChatWindowProps {
  sessionId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatarUrl?: string | null;
  onBack?: () => void;
  /** Called after this session is marked read (on open and on each poll). */
  onRead?: () => void;
  /** Shown as a CTA once the session has ended, if provided. */
  onBookNext?: () => void;
}

export function ChatWindow({
  sessionId,
  currentUserId,
  otherPartyName,
  otherPartyAvatarUrl,
  onBack,
  onRead,
  onBookNext,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [patientEntitlements, setPatientEntitlements] = useState<PlanConfig | null>(null);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const messagesLoading = loadedSessionId !== sessionId;
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const [fetchedMessages, fetchedSession] = await Promise.all([getMessages(sessionId), getSessionById(sessionId)]);
    setMessages(fetchedMessages);
    setSession(fetchedSession);
    if (fetchedSession) {
      const patient = await getPatientById(fetchedSession.patientId);
      setPatientEntitlements(patient ? getEntitlements(patient) : null);
    }
    setLoadedSessionId(sessionId);
    await markSessionRead(sessionId, currentUserId);
    onRead?.();
  }, [sessionId, currentUserId, onRead]);

  useEffect(() => {
    Promise.all([getMessages(sessionId), getSessionById(sessionId)]).then(
      async ([fetchedMessages, fetchedSession]) => {
        setMessages(fetchedMessages);
        setSession(fetchedSession);
        if (fetchedSession) {
          const patient = await getPatientById(fetchedSession.patientId);
          setPatientEntitlements(patient ? getEntitlements(patient) : null);
        }
        setLoadedSessionId(sessionId);
        await markSessionRead(sessionId, currentUserId);
        onRead?.();
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, currentUserId]);

  // Refetches messages + session status every 4s — picks up a manual "End
  // session" from the other party, or an expiry, within one poll tick.
  usePolling(refresh, POLL_INTERVAL_MS);

  const active = session ? isSessionActive(session) : false;

  // Local 1s ticker purely to re-render the countdown from the already-fetched
  // session.expiresAt — no extra reads, this is the "client-side timer synced
  // to expiresAt" the countdown display needs.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(text: string, attachment: MessageAttachment | null) {
    setSendError(null);
    try {
      const optimistic = await sendMessage(sessionId, currentUserId, text, attachment);
      setMessages((prev) => [...prev, optimistic]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Couldn't send that message.");
      // The send was rejected because the session just locked (or the
      // attachment isn't allowed on this plan) — reflect that now.
      setSession(await getSessionById(sessionId));
    }
  }

  const remainingMs = session ? msRemaining(session) : 0;
  const warning = active && remainingMs <= WARNING_THRESHOLD_MS;

  // Only the patient can pay to extend, only once the window's actually run
  // out (not mid-session), and only on a plan that includes it.
  const canOfferExtend =
    !active && session?.status === "active" && session.patientId === currentUserId && !!patientEntitlements?.canPayToExtend;

  async function handleExtend() {
    setExtending(true);
    setExtendError(null);
    try {
      setSession(await extendSession(sessionId));
    } catch (err) {
      setExtendError(err instanceof Error ? err.message : "Couldn't extend the session.");
    }
    setExtending(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="-ml-2" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <Avatar size="sm">
          {otherPartyAvatarUrl && <AvatarImage src={otherPartyAvatarUrl} alt={otherPartyName} />}
          <AvatarFallback>{initials(otherPartyName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-bold text-[#071938]">{otherPartyName}</p>
          {session && (
            <p className={cn("flex items-center gap-1 text-[11px]", warning ? "font-medium text-destructive" : "text-muted-foreground")}>
              {active ? (
                <>
                  <Clock className="size-3" />
                  {formatCountdown(remainingMs)} remaining
                </>
              ) : (
                (() => {
                  const label = ENDED_LABELS[session.status] ?? "Session ended";
                  const when = session.endedAt ?? session.expiresAt ?? session.scheduledFor ?? session.startedAt;
                  return when ? `${label} · ${formatRelativeTimestamp(when)}` : label;
                })()
              )}
            </p>
          )}
        </div>
        {active && patientEntitlements?.canUseVideo && (
          <VideoCallDialog
            otherPartyName={otherPartyName}
            trigger={
              <Button variant="ghost" size="icon" title="Start video call" aria-label="Start video call">
                <Video className="size-4" />
              </Button>
            }
          />
        )}
      </div>
      {warning && session?.patientId === currentUserId && patientEntitlements && patientEntitlements.tier !== "max" && (
        <div className="flex items-center justify-between gap-2 bg-[#e7f1a8]/40 px-4 py-1.5 text-xs text-[#071938]">
          <span>Running low on time?</span>
          <Link href={PLAN_PATH} className="font-medium underline underline-offset-2">
            Upgrade for longer sessions
          </Link>
        </div>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messagesLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <div className={cn("h-9 w-40 animate-pulse rounded-2xl", i % 2 === 0 ? "bg-[#f2f1e8]" : "bg-muted")} />
            </div>
          ))
        ) : (
          <>
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
            )}
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                      isMine ? "bg-[#071938] text-[#fffef8]" : "bg-[#f2f1e8] text-[#071938]"
                    )}
                  >
                    {message.attachment?.type === "image" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={message.attachment.url}
                        alt="Shared attachment"
                        className={cn("max-w-full rounded-lg", message.text && "mb-2")}
                      />
                    )}
                    {message.attachment?.type === "document" && (
                      <a
                        href={message.attachment.url}
                        download={message.attachment.name}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs underline-offset-2 hover:underline",
                          isMine ? "border-white/20" : "border-[#071938]/15",
                          message.text && "mb-2"
                        )}
                      >
                        <FileText className="size-3.5 shrink-0" />
                        {message.attachment.name}
                      </a>
                    )}
                    {message.text && <p>{message.text}</p>}
                    <p className={cn("mt-1 text-[10px]", isMine ? "text-[#fffef8]/60" : "text-[#071938]/50")}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>
      {!messagesLoading &&
        (active ? (
          <>
            {sendError && <p className="px-4 pt-2 text-xs text-destructive">{sendError}</p>}
            <MessageInput
              onSend={handleSend}
              canShareImages={!!patientEntitlements?.canShareImages}
              canShareDocuments={!!patientEntitlements?.canShareDocuments}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {session ? (ENDED_LABELS[session.status] ?? "This session has ended.") : "This session has ended."}
            </p>
            {extendError && <p className="text-xs text-destructive">{extendError}</p>}
            <div className="flex flex-wrap justify-center gap-2">
              {canOfferExtend && (
                <Button size="sm" variant="outline" disabled={extending} onClick={handleExtend}>
                  {extending ? "Processing payment..." : `Extend +${patientEntitlements?.extendMins} min`}
                </Button>
              )}
              {onBookNext && (
                <Button size="sm" onClick={onBookNext}>
                  Book next session
                </Button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
