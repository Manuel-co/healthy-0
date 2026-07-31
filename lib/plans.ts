import { getSessionsForPatient } from "@/lib/sessions-data";
import type { Patient, PlanTier, Subscription } from "@/lib/types";

export interface PlanPrice {
  /** TODO: fill in the real NGN price before launch — left null so nobody ships a guessed number. */
  amountKobo: number | null;
  currency: "NGN";
}

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  sessionsPerMonth: number;
  sessionLengthMins: number;
  canShareDocuments: boolean;
  canShareImages: boolean;
  canUseVideo: boolean;
  canPayToExtend: boolean;
  extendMins: number;
  /** Whether the patient picks their own doctor, vs. being auto-matched (see lib/matching.ts, later phase). */
  canChooseDoctor: boolean;
  price: PlanPrice;
}

/**
 * The single source of truth for what each plan tier includes. Every
 * entitlement check in the app (session length, quota, attachments, video,
 * doctor choice) reads from this map — no tier rule should ever be
 * hard-coded in a component or another lib file.
 */
export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  basic: {
    tier: "basic",
    name: "Basic",
    sessionsPerMonth: 3,
    sessionLengthMins: 30,
    canShareDocuments: false,
    canShareImages: false,
    canUseVideo: false,
    canPayToExtend: true,
    extendMins: 10,
    canChooseDoctor: false,
    price: { amountKobo: null, currency: "NGN" }, // TODO: set Basic's NGN price
  },
  pro: {
    tier: "pro",
    name: "Pro",
    sessionsPerMonth: 10,
    sessionLengthMins: 45,
    canShareDocuments: true,
    canShareImages: false,
    canUseVideo: false,
    canPayToExtend: false,
    extendMins: 0,
    canChooseDoctor: true,
    price: { amountKobo: null, currency: "NGN" }, // TODO: set Pro's NGN price
  },
  max: {
    tier: "max",
    name: "Max",
    sessionsPerMonth: 20,
    sessionLengthMins: 60,
    canShareDocuments: true,
    canShareImages: true,
    canUseVideo: true,
    canPayToExtend: false,
    extendMins: 0,
    canChooseDoctor: true,
    price: { amountKobo: null, currency: "NGN" }, // TODO: set Max's NGN price
  },
};

export const DEFAULT_PLAN_TIER: PlanTier = "basic";

/** A fresh Subscription for a newly-signed-up patient — always starts on Basic. */
export function createDefaultSubscription(now: Date = new Date()): Subscription {
  return {
    tier: DEFAULT_PLAN_TIER,
    cycleStartDate: now.toISOString(),
    status: "active",
  };
}

/** Defensive fallback to Basic if a Patient somehow lacks a subscription — see the
 *  backfill in lib/auth/mock-db.ts's getUsers() for why that shouldn't happen via
 *  the normal read path, but this keeps the app from crashing if it ever does. */
export function getEntitlements(patient: Patient): PlanConfig {
  return PLAN_CONFIG[patient.subscription?.tier ?? DEFAULT_PLAN_TIER];
}

/** The monthly quota window always resets on calendar-month boundaries, not on cycleStartDate. */
function currentCycleStart(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * How many of the patient's monthly sessions are already spent this
 * calendar month. Booking a session (status "scheduled") reserves the slot
 * immediately, same as starting one ad-hoc; cancelling releases it back.
 * A no-show still counts as used. This is a judgment call to confirm before
 * Phase 2 enforcement leans on it.
 */
export async function sessionsUsedThisCycle(patient: Patient): Promise<number> {
  const sessions = await getSessionsForPatient(patient.id);
  const cycleStart = currentCycleStart();
  return sessions.filter((s) => {
    if (s.status === "cancelled") return false;
    const timestamp = s.scheduledFor ?? s.startedAt;
    return !!timestamp && new Date(timestamp) >= cycleStart;
  }).length;
}

export async function sessionsRemaining(patient: Patient): Promise<number> {
  const used = await sessionsUsedThisCycle(patient);
  return Math.max(0, getEntitlements(patient).sessionsPerMonth - used);
}

export async function canStartSession(patient: Patient): Promise<boolean> {
  return (await sessionsRemaining(patient)) > 0;
}
