import { getUsers } from "@/lib/auth/mock-db";
import { getPatientsForDoctor } from "@/lib/doctors-data";
import { getSessionsForPair, canSendMessage } from "@/lib/sessions-data";
import type { Message, Patient, Session } from "@/lib/types";

const MESSAGES_KEY = "hz_messages";
const MESSAGES_SEED_VERSION_KEY = "hz_messages_seed_version";
// Bump whenever seedMessages()'s shape changes (see lib/auth/mock-db.ts for
// why: stale localStorage data from an earlier session would otherwise be
// missing newer Message fields).
const MESSAGES_SEED_VERSION = "3";

const READ_RECEIPTS_KEY = "hz_read_receipts";

/** Per (session, user) read cursor — a message is unread if it postdates this. */
interface ReadReceipt {
  sessionId: string;
  userId: string;
  lastReadAt: string;
}

/**
 * Reads/writes localStorage today. Every export here is async so the
 * component call sites already match the shape of a future Supabase
 * fetch/polling call — swapping the body later shouldn't require
 * touching any UI component.
 */

function seedMessages(): Message[] {
  return [
    {
      id: "msg-1",
      sessionId: "session-1",
      senderId: "doctor-1",
      text: "Hi Jordan, how has your week been since our last session?",
      imageUrl: null,
      createdAt: "2026-07-20T14:00:00.000Z",
    },
    {
      id: "msg-2",
      sessionId: "session-1",
      senderId: "patient-1",
      text: "Better, thanks. I've been keeping up with the journaling exercise.",
      imageUrl: null,
      createdAt: "2026-07-20T14:05:00.000Z",
    },
    {
      id: "msg-3",
      sessionId: "session-1",
      senderId: "doctor-1",
      text: "That's great to hear. Let's dig into that at our next session.",
      imageUrl: null,
      createdAt: "2026-07-20T14:07:00.000Z",
    },
  ];
}

function readMessages(): Message[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(MESSAGES_KEY);
  const seededAtVersion = window.localStorage.getItem(MESSAGES_SEED_VERSION_KEY);
  if (!raw || seededAtVersion !== MESSAGES_SEED_VERSION) {
    const seeded = seedMessages();
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(seeded));
    window.localStorage.setItem(MESSAGES_SEED_VERSION_KEY, MESSAGES_SEED_VERSION);
    return seeded;
  }
  return JSON.parse(raw) as Message[];
}

function writeMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

function readReceipts(): ReadReceipt[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(READ_RECEIPTS_KEY);
  return raw ? (JSON.parse(raw) as ReadReceipt[]) : [];
}

function writeReceipts(receipts: ReadReceipt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_RECEIPTS_KEY, JSON.stringify(receipts));
}

function getLastReadAt(sessionId: string, userId: string): string | null {
  const receipt = readReceipts().find((r) => r.sessionId === sessionId && r.userId === userId);
  return receipt?.lastReadAt ?? null;
}

/** Call when a user opens a session, so its unread count clears. */
export async function markSessionRead(sessionId: string, userId: string): Promise<void> {
  const receipts = readReceipts();
  const now = new Date().toISOString();
  const index = receipts.findIndex((r) => r.sessionId === sessionId && r.userId === userId);
  if (index === -1) {
    receipts.push({ sessionId, userId, lastReadAt: now });
  } else {
    receipts[index] = { ...receipts[index], lastReadAt: now };
  }
  writeReceipts(receipts);
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  return readMessages()
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getLastMessage(sessionId: string): Promise<Message | null> {
  const messages = await getMessages(sessionId);
  return messages[messages.length - 1] ?? null;
}

export async function getUnreadCountForSession(sessionId: string, userId: string): Promise<number> {
  const messages = await getMessages(sessionId);
  const lastReadAt = getLastReadAt(sessionId, userId);
  return messages.filter((m) => m.senderId !== userId && (!lastReadAt || m.createdAt > lastReadAt)).length;
}

export function messagePreviewText(message: Message): string {
  if (message.text) return message.text;
  if (message.imageUrl) return "📷 Photo";
  return "";
}

/**
 * Enforces the lock itself — a session that's expired or completed can't be
 * posted to even by a stale client calling this function directly. Hiding
 * the composer in the UI is presentation on top of this, not the guard.
 */
export async function sendMessage(
  sessionId: string,
  senderId: string,
  text: string,
  imageUrl: string | null = null
): Promise<Message> {
  if (!(await canSendMessage(sessionId))) {
    throw new Error("This session has ended and can no longer accept messages.");
  }
  const message: Message = {
    id: `msg-${Date.now()}`,
    sessionId,
    senderId,
    text,
    imageUrl,
    createdAt: new Date().toISOString(),
  };
  writeMessages([...readMessages(), message]);
  return message;
}

export interface DoctorSessionSummary {
  patient: Patient;
  /** The patient's most recent session (active or completed), or null if they've never had one. */
  currentSession: Session | null;
  lastMessage: Message | null;
  unreadCount: number;
}

/**
 * The single source of truth for per-patient session state on the doctor
 * side — unread count and last-message metadata, aggregated across ALL of a
 * patient's sessions (a doctor can leave a completed session with unread
 * messages, and that should still count). Both the roster and the inbox
 * read through this so the two views can never disagree.
 */
export async function getSessionSummariesForDoctor(doctorId: string): Promise<DoctorSessionSummary[]> {
  const patients = await getPatientsForDoctor(doctorId);
  return Promise.all(
    patients.map(async (patient) => {
      const sessions = await getSessionsForPair(patient.id, doctorId);
      const currentSession = sessions[0] ?? null;

      let lastMessage: Message | null = null;
      let unreadCount = 0;
      for (const session of sessions) {
        const sessionLast = await getLastMessage(session.id);
        if (sessionLast && (!lastMessage || sessionLast.createdAt > lastMessage.createdAt)) {
          lastMessage = sessionLast;
        }
        unreadCount += await getUnreadCountForSession(session.id, doctorId);
      }

      return { patient, currentSession, lastMessage, unreadCount };
    })
  );
}

const NEEDS_ATTENTION_NO_CONTACT_DAYS = 7;

export interface AttentionItem {
  summary: DoctorSessionSummary;
  reason: "unread" | "no-contact";
  /** Days since last contact (or since the patient joined, if never contacted) — only set for "no-contact". */
  staleDays?: number;
}

/**
 * Patients a doctor should look at: anyone with unread messages, plus anyone
 * not contacted in over a week (using the patient's join date as the baseline
 * when there's no message history at all — an assigned-but-never-contacted
 * patient is exactly the case this should catch).
 */
export async function getPatientsNeedingAttention(doctorId: string): Promise<AttentionItem[]> {
  const summaries = await getSessionSummariesForDoctor(doctorId);
  const thresholdMs = NEEDS_ATTENTION_NO_CONTACT_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return summaries.flatMap((summary): AttentionItem[] => {
    if (summary.unreadCount > 0) return [{ summary, reason: "unread" }];

    const referenceDate = summary.lastMessage?.createdAt ?? summary.patient.createdAt;
    const staleMs = now - new Date(referenceDate).getTime();
    if (staleMs > thresholdMs) {
      return [{ summary, reason: "no-contact", staleDays: Math.floor(staleMs / (24 * 60 * 60 * 1000)) }];
    }
    return [];
  });
}

export interface DoctorRosterStats {
  totalPatients: number;
  activeConversations: number;
  unreadMessages: number;
}

export async function getDoctorRosterStats(doctorId: string): Promise<DoctorRosterStats> {
  const summaries = await getSessionSummariesForDoctor(doctorId);
  return {
    totalPatients: summaries.length,
    activeConversations: summaries.filter((s) => s.lastMessage !== null).length,
    unreadMessages: summaries.reduce((sum, s) => sum + s.unreadCount, 0),
  };
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isWithinLastWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() <= ONE_WEEK_MS;
}

export interface PlatformStatsTrends {
  newPatientsThisWeek: number;
  newDoctorsThisWeek: number;
  newMessagesThisWeek: number;
  newPendingThisWeek: number;
}

export interface PlatformStats {
  totalPatients: number;
  totalDoctors: number;
  totalMessages: number;
  pendingVerifications: number;
  trends: PlatformStatsTrends;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const users = getUsers();
  const messages = readMessages();
  const patients = users.filter((u) => u.role === "patient");
  const doctors = users.filter((u) => u.role === "doctor");
  const pending = users.filter((u) => u.role !== "admin" && u.verificationStatus === "pending");

  return {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalMessages: messages.length,
    pendingVerifications: pending.length,
    trends: {
      newPatientsThisWeek: patients.filter((p) => isWithinLastWeek(p.createdAt)).length,
      newDoctorsThisWeek: doctors.filter((d) => isWithinLastWeek(d.createdAt)).length,
      newMessagesThisWeek: messages.filter((m) => isWithinLastWeek(m.createdAt)).length,
      newPendingThisWeek: pending.filter((p) => isWithinLastWeek(p.createdAt)).length,
    },
  };
}
