export type Role = "patient" | "doctor" | "admin";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface KycInfo {
  idType: string;
  idNumber: string;
  documentName: string;
}

export interface BaseUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string; // mock only — never store plaintext in a real backend
  createdAt: string;
  banned: boolean;
}

export interface Patient extends BaseUser {
  role: "patient";
  dob: string;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
}

export interface Doctor extends BaseUser {
  role: "doctor";
  specialty: string;
  licenseNumber: string;
  focusAreas: string[];
  languages: string[];
  yearsExperience: number;
  bio: string;
  acceptingNewPatients: boolean;
  profileImageUrl: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  kyc: KycInfo;
}

export interface Admin extends BaseUser {
  role: "admin";
}

export type User = Patient | Doctor | Admin;

export type AssignmentStatus = "requested" | "active" | "declined" | "ended";

/**
 * The source of truth for the patient↔doctor relationship. A patient may have
 * many Assignment records over time, but at most one with status "active"
 * (enforced where assignments are created/accepted, not here).
 */
export interface Assignment {
  id: string;
  patientId: string;
  doctorId: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = "active" | "completed";

/**
 * A time-boxed doctor↔patient chat thread. startedAt is set when someone
 * joins (not a scheduled time), expiresAt = startedAt + SESSION_DURATION_MINS
 * (see lib/sessions-data.ts). Once locked (expired or manually ended), the
 * thread's messages stay readable forever but can't accept new ones.
 */
export interface Session {
  id: string;
  patientId: string;
  doctorId: string;
  status: SessionStatus;
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
}

/** A doctor's private note attached to a session. No UI yet — data layer only. */
export interface SessionNote {
  id: string;
  sessionId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
}
