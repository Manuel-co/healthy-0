import { getPatientById } from "@/lib/patients-data";
import type { Session, SessionNote, SessionStatus } from "@/lib/types";

/** Single source of truth for how long a session stays live once started. */
export const SESSION_DURATION_MINS = 30;

const SESSIONS_KEY = "hz_sessions";
const SESSIONS_SEED_VERSION_KEY = "hz_sessions_seed_version";
const SESSIONS_SEED_VERSION = "1";

const SESSION_NOTES_KEY = "hz_session_notes";

function seedSessions(): Session[] {
  // Migrates the old always-open conv-1 thread into a completed first session
  // so its 3 seeded messages remain readable as history.
  return [
    {
      id: "session-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      status: "completed",
      startedAt: "2026-07-20T14:00:00.000Z",
      expiresAt: "2026-07-20T14:30:00.000Z",
      endedAt: "2026-07-20T14:30:00.000Z",
    },
  ];
}

function readSessions(): Session[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SESSIONS_KEY);
  const seededAtVersion = window.localStorage.getItem(SESSIONS_SEED_VERSION_KEY);
  if (!raw || seededAtVersion !== SESSIONS_SEED_VERSION) {
    const seeded = seedSessions();
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(seeded));
    window.localStorage.setItem(SESSIONS_SEED_VERSION_KEY, SESSIONS_SEED_VERSION);
    return seeded;
  }
  return JSON.parse(raw) as Session[];
}

function writeSessions(sessions: Session[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function readSessionNotes(): SessionNote[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SESSION_NOTES_KEY);
  return raw ? (JSON.parse(raw) as SessionNote[]) : [];
}

function writeSessionNotes(notes: SessionNote[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_NOTES_KEY, JSON.stringify(notes));
}

/** Pure, sync, and recomputed from expiresAt every call — this is what makes
 *  reopening a tab after the window lapsed correctly show "locked" with no
 *  background timer needed. */
export function isSessionActive(session: Session): boolean {
  return session.status === "active" && Date.now() < new Date(session.expiresAt).getTime();
}

export function msRemaining(session: Session): number {
  return Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
}

async function setSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
  const sessions = readSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return;
  sessions[index] = { ...sessions[index], status, endedAt: status === "completed" ? new Date().toISOString() : null };
  writeSessions(sessions);
}

export async function getSessionById(id: string): Promise<Session | null> {
  return readSessions().find((s) => s.id === id) ?? null;
}

export async function getSessionsForPair(patientId: string, doctorId: string): Promise<Session[]> {
  return readSessions()
    .filter((s) => s.patientId === patientId && s.doctorId === doctorId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/**
 * The session that should currently be shown as live for this pair, or null
 * if there isn't one. Lazily flips a stale "active" record to "completed" if
 * its window has lapsed since it was last checked (e.g. the tab was closed
 * through the expiry time) — the caller just sees "no current session".
 */
export async function getCurrentSession(patientId: string, doctorId: string): Promise<Session | null> {
  const sessions = await getSessionsForPair(patientId, doctorId);
  const candidate = sessions.find((s) => s.status === "active");
  if (!candidate) return null;
  if (isSessionActive(candidate)) return candidate;
  await setSessionStatus(candidate.id, "completed");
  return null;
}

/**
 * Starts a fresh session. Re-checks patient eligibility here (not just in the
 * calling UI) so a locked/expired client can't bypass the gate by calling
 * this directly.
 */
export async function startSession(patientId: string, doctorId: string): Promise<Session> {
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Patient not found.");
  if (patient.banned) throw new Error("This patient's account has been banned.");
  if (patient.verificationStatus !== "verified") {
    throw new Error("This patient's account is still pending verification.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MINS * 60_000);
  const session: Session = {
    id: `session-${Date.now()}`,
    patientId,
    doctorId,
    status: "active",
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    endedAt: null,
  };
  writeSessions([...readSessions(), session]);
  return session;
}

export async function endSession(sessionId: string): Promise<void> {
  await setSessionStatus(sessionId, "completed");
}

export async function canSendMessage(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId);
  return !!session && isSessionActive(session);
}

/** Every session across all of a doctor's patients — active first, then newest. */
export async function getSessionsForDoctor(doctorId: string): Promise<Session[]> {
  return readSessions()
    .filter((s) => s.doctorId === doctorId)
    .sort((a, b) => {
      const aActive = a.status === "active";
      const bActive = b.status === "active";
      if (aActive !== bActive) return aActive ? -1 : 1;
      return b.startedAt.localeCompare(a.startedAt);
    });
}

export async function addSessionNote(sessionId: string, authorId: string, text: string): Promise<SessionNote> {
  const note: SessionNote = { id: `note-${Date.now()}`, sessionId, authorId, text, createdAt: new Date().toISOString() };
  writeSessionNotes([...readSessionNotes(), note]);
  return note;
}

export async function getSessionNotes(sessionId: string): Promise<SessionNote[]> {
  return readSessionNotes().filter((n) => n.sessionId === sessionId);
}
