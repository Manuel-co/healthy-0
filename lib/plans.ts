import { getSessionsForPatient } from "@/lib/sessions-data";
import { getPatientById } from "@/lib/patients-data";
import { updateUser } from "@/lib/auth/mock-db";
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

/**
 * Mock checkout — no real payment gateway. Takes effect immediately: the new
 * tier's quota and session length apply right away, with no proration.
 * cycleStartDate resets to mark when this (new) subscription began; the
 * monthly quota window itself is calendar-month based regardless (see
 * currentCycleStart), so this doesn't change how much of the current
 * month's usage already counts against the new limit.
 */
export async function changeSubscriptionTier(patientId: string, tier: PlanTier): Promise<Patient> {
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Patient not found.");
  const subscription: Subscription = { tier, cycleStartDate: new Date().toISOString(), status: "active" };
  updateUser(patientId, { subscription });
  return { ...patient, subscription };
}

/** basic < pro < max — used to label a plan switch as an upgrade or downgrade. */
export const PLAN_RANK: Record<PlanTier, number> = { basic: 0, pro: 1, max: 2 };

export function formatPlanPrice(price: PlanPrice): string {
  if (price.amountKobo === null) return "Pricing TBA";
  return `₦${(price.amountKobo / 100).toLocaleString()}/mo`;
}

/**
 * The plain-English feature list for a tier, derived entirely from
 * PLAN_CONFIG — used by both the in-app plan page and the public marketing
 * pricing section so the two can never drift apart.
 */
export function planFeatures(plan: PlanConfig): string[] {
  const features = [
    `${plan.sessionsPerMonth} sessions/month`,
    `${plan.sessionLengthMins}-minute sessions`,
    plan.canChooseDoctor ? "Choose your own doctor" : "Matched with a doctor for you",
  ];
  if (plan.canPayToExtend) features.push(`Pay to extend +${plan.extendMins} min when a session runs out`);
  if (plan.canShareDocuments) features.push("Share documents");
  if (plan.canShareImages) features.push("Share images");
  if (plan.canUseVideo) features.push("Video sessions");
  return features;
}
