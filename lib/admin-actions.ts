import { updateUser } from "@/lib/auth/mock-db";

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
