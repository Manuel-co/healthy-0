import { getUsers, updateUser } from "@/lib/auth/mock-db";
import type { Doctor, Patient } from "@/lib/types";

export type EffectiveStatus = "verified" | "pending" | "rejected" | "banned";

/** Mirrors StatusBadge's own precedence: banned always wins over verificationStatus. */
export function getEffectiveStatus(user: Patient | Doctor): EffectiveStatus {
  if (user.banned) return "banned";
  return user.verificationStatus;
}

/** Ranks accounts needing admin attention first: pending, then rejected, then banned, then verified. */
const EFFECTIVE_STATUS_PRIORITY: Record<EffectiveStatus, number> = {
  pending: 0,
  rejected: 1,
  banned: 2,
  verified: 3,
};

export function effectiveStatusPriority(user: Patient | Doctor): number {
  return EFFECTIVE_STATUS_PRIORITY[getEffectiveStatus(user)];
}

/** Every non-admin account awaiting review, newest submission first. */
export async function getPendingVerifications(): Promise<(Patient | Doctor)[]> {
  return getUsers()
    .filter((u): u is Patient | Doctor => u.role !== "admin" && u.verificationStatus === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function verifyUser(id: string): Promise<void> {
  updateUser(id, { verificationStatus: "verified", rejectionReason: null });
}

export async function rejectUser(id: string, reason: string): Promise<void> {
  updateUser(id, { verificationStatus: "rejected", rejectionReason: reason });
}

export async function banUser(id: string): Promise<void> {
  updateUser(id, { banned: true });
}

export async function unbanUser(id: string): Promise<void> {
  updateUser(id, { banned: false });
}
