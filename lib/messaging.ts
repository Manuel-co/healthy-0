import { getUsers } from "@/lib/auth/mock-db";
import type { Conversation, Message } from "@/lib/types";

const CONVERSATIONS_KEY = "hz_conversations";
const MESSAGES_KEY = "hz_messages";
const MESSAGES_SEED_VERSION_KEY = "hz_messages_seed_version";
// Bump whenever seedMessages()'s shape changes (see lib/auth/mock-db.ts for
// why: stale localStorage data from an earlier session would otherwise be
// missing newer Message fields).
const MESSAGES_SEED_VERSION = "2";

/**
 * Reads/writes localStorage today. Every export here is async so the
 * component call sites already match the shape of a future Supabase
 * fetch/polling call — swapping the body later shouldn't require
 * touching any UI component.
 */

function seedConversations(): Conversation[] {
  return [{ id: "conv-1", patientId: "patient-1", doctorId: "doctor-1" }];
}

function seedMessages(): Message[] {
  return [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "doctor-1",
      text: "Hi Jordan, how has your week been since our last session?",
      imageUrl: null,
      createdAt: "2026-07-20T14:00:00.000Z",
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "patient-1",
      text: "Better, thanks. I've been keeping up with the journaling exercise.",
      imageUrl: null,
      createdAt: "2026-07-20T14:05:00.000Z",
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "doctor-1",
      text: "That's great to hear. Let's dig into that at our next session.",
      imageUrl: null,
      createdAt: "2026-07-20T14:07:00.000Z",
    },
  ];
}

function readConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CONVERSATIONS_KEY);
  if (!raw) {
    const seeded = seedConversations();
    window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw) as Conversation[];
}

function writeConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
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

export async function getOrCreateConversation(patientId: string, doctorId: string): Promise<Conversation> {
  const conversations = readConversations();
  const existing = conversations.find((c) => c.patientId === patientId && c.doctorId === doctorId);
  if (existing) return existing;
  const created: Conversation = { id: `conv-${Date.now()}`, patientId, doctorId };
  writeConversations([...conversations, created]);
  return created;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return readMessages()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getLastMessage(conversationId: string): Promise<Message | null> {
  const messages = await getMessages(conversationId);
  return messages[messages.length - 1] ?? null;
}

export function messagePreviewText(message: Message): string {
  if (message.text) return message.text;
  if (message.imageUrl) return "📷 Photo";
  return "";
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  imageUrl: string | null = null
): Promise<Message> {
  const message: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    text,
    imageUrl,
    createdAt: new Date().toISOString(),
  };
  writeMessages([...readMessages(), message]);
  return message;
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
