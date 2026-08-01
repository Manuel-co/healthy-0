import { getPatientById } from "@/lib/patients-data";
import { createNotification, hasNotificationFor } from "@/lib/notifications-data";
import { getEntitlements, canStartSession } from "@/lib/plans";
import type { Patient, Session, SessionNote, SessionStatus } from "@/lib/types";

const SESSIONS_KEY = "hz_sessions";
const SESSIONS_SEED_VERSION_KEY = "hz_sessions_seed_version";
const SESSIONS_SEED_VERSION = "2";

const SESSION_NOTES_KEY = "hz_session_notes";

const TERMINAL_STATUSES: SessionStatus[] = ["completed", "cancelled", "no-show"];

function seedSessions(): Session[] {
  // Migrates the old always-open conv-1 thread into a completed first session
  // so its 3 seeded messages remain readable as history.
  return [
    {
      id: "session-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      status: "completed",
      scheduledFor: null,
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

/** A session's best-known timestamp for sorting: when it actually started,
 *  else when it's booked for, else it has neither and sorts last. */
function effectiveTimestamp(session: Session): string {
  return session.startedAt ?? session.scheduledFor ?? "";
}

/** Pure, sync, and recomputed from expiresAt every call — this is what makes
 *  reopening a tab after the window lapsed correctly show "locked" with no
 *  background timer needed. */
export function isSessionActive(session: Session): boolean {
  return session.status === "active" && session.expiresAt !== null && Date.now() < new Date(session.expiresAt).getTime();
}

export function msRemaining(session: Session): number {
  if (!session.expiresAt) return 0;
  return Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
}

/** True once a scheduled session's booked time has arrived and it's ready to join. */
export function canJoinSession(session: Session): boolean {
  return session.status === "scheduled" && !!session.scheduledFor && Date.now() >= new Date(session.scheduledFor).getTime();
}

async function assertPatientEligible(patientId: string): Promise<Patient> {
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Patient not found.");
  if (patient.banned) throw new Error("This patient's account has been banned.");
  if (patient.verificationStatus !== "verified") {
    throw new Error("This patient's account is still pending verification.");
  }
  return patient;
}

async function setSessionStatus(sessionId: string, status: SessionStatus): Promise<Session | null> {
  const sessions = readSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return null;
  sessions[index] = {
    ...sessions[index],
    status,
    endedAt: TERMINAL_STATUSES.includes(status) ? new Date().toISOString() : sessions[index].endedAt,
  };
  writeSessions(sessions);
  return sessions[index];
}

export async function getSessionById(id: string): Promise<Session | null> {
  return readSessions().find((s) => s.id === id) ?? null;
}

export async function getSessionsForPair(patientId: string, doctorId: string): Promise<Session[]> {
  return readSessions()
    .filter((s) => s.patientId === patientId && s.doctorId === doctorId)
    .sort((a, b) => effectiveTimestamp(b).localeCompare(effectiveTimestamp(a)));
}

/**
 * Terminal-state sessions only (completed/cancelled/no-show), newest-ended
 * first — the "session history" list, distinct from "what's next".
 */
export async function getSessionHistory(patientId: string, doctorId: string): Promise<Session[]> {
  const sessions = await getSessionsForPair(patientId, doctorId);
  return sessions
    .filter((s) => TERMINAL_STATUSES.includes(s.status))
    .sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? ""));
}

/**
 * Same as getSessionHistory, but across every doctor the patient has ever
 * had (not just the current one) — a patient who switched doctors keeps
 * their full history, spanning multiple doctorIds.
 */
export async function getSessionHistoryForPatient(patientId: string): Promise<Session[]> {
  return readSessions()
    .filter((s) => s.patientId === patientId && TERMINAL_STATUSES.includes(s.status))
    .sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? ""));
}

/**
 * Every session for a patient, any status, any doctor — the raw list
 * lib/plans.ts reads to compute monthly quota usage.
 */
export async function getSessionsForPatient(patientId: string): Promise<Session[]> {
  return readSessions()
    .filter((s) => s.patientId === patientId)
    .sort((a, b) => effectiveTimestamp(b).localeCompare(effectiveTimestamp(a)));
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
 * What the patient/doctor should see as "what's next": the live session if
 * there is one, else the soonest upcoming scheduled session, else null.
 */
export async function getNextSession(patientId: string, doctorId: string): Promise<Session | null> {
  const active = await getCurrentSession(patientId, doctorId);
  if (active) return active;

  const sessions = await getSessionsForPair(patientId, doctorId);
  const scheduled = sessions
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""));
  return scheduled[0] ?? null;
}

/**
 * Starts a session immediately (ad-hoc — no booking). Re-checks patient
 * eligibility here (not just in the calling UI) so a locked/expired client
 * can't bypass the gate by calling this directly.
 */
export async function startSession(patientId: string, doctorId: string): Promise<Session> {
  const patient = await assertPatientEligible(patientId);
  if (!(await canStartSession(patient))) {
    throw new Error(
      `You've used all ${getEntitlements(patient).sessionsPerMonth} sessions in your ${getEntitlements(patient).name} plan this month. Upgrade for more.`
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + getEntitlements(patient).sessionLengthMins * 60_000);
  const session: Session = {
    id: `session-${Date.now()}`,
    patientId,
    doctorId,
    status: "active",
    scheduledFor: null,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    endedAt: null,
  };
  writeSessions([...readSessions(), session]);
  return session;
}

/** Books a session for a future time. Sits idle ("scheduled") until joinSession is called. */
export async function scheduleSession(patientId: string, doctorId: string, scheduledFor: string): Promise<Session> {
  const patient = await assertPatientEligible(patientId);
  if (!(await canStartSession(patient))) {
    throw new Error(
      `You've used all ${getEntitlements(patient).sessionsPerMonth} sessions in your ${getEntitlements(patient).name} plan this month. Upgrade for more.`
    );
  }

  const session: Session = {
    id: `session-${Date.now()}`,
    patientId,
    doctorId,
    status: "scheduled",
    scheduledFor,
    startedAt: null,
    expiresAt: null,
    endedAt: null,
  };
  writeSessions([...readSessions(), session]);
  return session;
}

/**
 * Joins a scheduled session, actually starting its (plan-length) window now
 * (not at the originally-booked time — a late join still gets the full window).
 */
export async function joinSession(sessionId: string): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.status !== "scheduled") throw new Error("This session can't be joined.");
  const patient = await assertPatientEligible(session.patientId);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + getEntitlements(patient).sessionLengthMins * 60_000);
  const sessions = readSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  sessions[index] = { ...sessions[index], status: "active", startedAt: now.toISOString(), expiresAt: expiresAt.toISOString() };
  writeSessions(sessions);
  return sessions[index];
}

export async function endSession(sessionId: string): Promise<void> {
  await setSessionStatus(sessionId, "completed");
}

/**
 * Mock "pay to extend" — stubbed, no real payment gateway. Only available on
 * tiers with canPayToExtend (currently Basic); pushes expiresAt out by
 * extendMins from now (not from the stale, already-passed expiresAt, so the
 * patient reliably gets a full extra window regardless of how late they pay).
 * Mutates the existing session record rather than creating a new one, so
 * this never touches the monthly quota.
 */
export async function extendSession(sessionId: string): Promise<Session> {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.status !== "active") throw new Error("This session can't be extended.");

  const patient = await getPatientById(session.patientId);
  if (!patient) throw new Error("Patient not found.");
  const entitlements = getEntitlements(patient);
  if (!entitlements.canPayToExtend) {
    throw new Error(`Session extensions aren't available on the ${entitlements.name} plan.`);
  }

  const expiresAt = new Date(Date.now() + entitlements.extendMins * 60_000);
  const sessions = readSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  sessions[index] = { ...sessions[index], expiresAt: expiresAt.toISOString() };
  writeSessions(sessions);
  return sessions[index];
}

/** Cancels a session that hasn't started yet. actorId is who initiated it (for notifying the other party). */
export async function cancelSession(sessionId: string, actorId: string): Promise<Session | null> {
  const session = await getSessionById(sessionId);
  if (!session || session.status !== "scheduled") return null;
  const updated = await setSessionStatus(sessionId, "cancelled");

  const recipientId = actorId === session.patientId ? session.doctorId : session.patientId;
  const recipientIsPatient = recipientId === session.patientId;
  await createNotification(
    recipientId,
    "session-cancelled",
    "Session cancelled",
    "A scheduled session was cancelled.",
    recipientIsPatient ? "/dashboard/patient/messages" : `/dashboard/doctor/patients/${session.patientId}`,
    sessionId
  );

  return updated;
}

export async function markNoShow(sessionId: string): Promise<Session | null> {
  const session = await getSessionById(sessionId);
  if (!session || session.status !== "scheduled") return null;
  return setSessionStatus(sessionId, "no-show");
}

export async function canSendMessage(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId);
  return !!session && isSessionActive(session);
}

/** Every session across all of a doctor's patients — active/scheduled first, then newest. */
export async function getSessionsForDoctor(doctorId: string): Promise<Session[]> {
  return readSessions()
    .filter((s) => s.doctorId === doctorId)
    .sort((a, b) => {
      const aNeedsAttention = a.status === "active" || a.status === "scheduled";
      const bNeedsAttention = b.status === "active" || b.status === "scheduled";
      if (aNeedsAttention !== bNeedsAttention) return aNeedsAttention ? -1 : 1;
      return effectiveTimestamp(b).localeCompare(effectiveTimestamp(a));
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

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Lazily generates "your session is coming up" reminders for scheduled
 * sessions within the next 24h — there's no cron in a mock app, so this
 * runs whenever the patient dashboard mounts instead. Dedupes via
 * hasNotificationFor so it doesn't re-notify on every check.
 */
export async function ensureUpcomingSessionReminders(patientId: string, doctorId: string): Promise<void> {
  const sessions = await getSessionsForPair(patientId, doctorId);
  const now = Date.now();

  for (const session of sessions) {
    if (session.status !== "scheduled" || !session.scheduledFor) continue;
    const msUntil = new Date(session.scheduledFor).getTime() - now;
    if (msUntil < 0 || msUntil > REMINDER_WINDOW_MS) continue;
    if (await hasNotificationFor(patientId, "session-reminder", session.id)) continue;

    await createNotification(
      patientId,
      "session-reminder",
      "Upcoming session",
      `Your session is coming up on ${new Date(session.scheduledFor).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}.`,
      "/dashboard/patient/messages",
      session.id
    );
  }
}
