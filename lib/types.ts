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

export type PlanTier = "basic" | "pro" | "max";

export type SubscriptionStatus = "active" | "cancelled";

/**
 * A patient's plan enrollment. cycleStartDate marks when this subscription
 * (tier) became active — a billing-anchor/display field. The monthly session
 * quota itself always resets on calendar-month boundaries (see
 * lib/plans.ts), independent of this date.
 */
export interface Subscription {
  tier: PlanTier;
  cycleStartDate: string;
  status: SubscriptionStatus;
}

export type UrgencyLevel = "low" | "medium" | "high";

/**
 * The find-a-doctor intake — drives lib/matching.ts. focusAreas draws from
 * the controlled vocabulary in lib/focus-areas.ts so it's directly
 * comparable to Doctor.focusAreas. null on the Patient until they've
 * completed it at least once.
 */
export interface Intake {
  focusAreas: string[];
  preferredLanguage: string | null;
  urgency: UrgencyLevel | null;
  completedAt: string;
}

export interface Patient extends BaseUser {
  role: "patient";
  dob: string;
  /** The patient's own words on why they're seeking care — the intake note the doctor reads. */
  presentingConcern: string;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  subscription: Subscription;
  intake: Intake | null;
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

export type SessionStatus = "scheduled" | "active" | "completed" | "cancelled" | "no-show";

/**
 * A time-boxed doctor↔patient chat thread. Either started ad-hoc (startedAt
 * set immediately, scheduledFor null) or booked ahead ("scheduled": sits idle
 * with scheduledFor set until someone joins, which is what actually sets
 * startedAt/expiresAt — a late join still gets the full window). Once locked
 * (expired, manually ended, cancelled, or a no-show), the thread's messages
 * stay readable forever but can't accept new ones.
 */
export interface Session {
  id: string;
  patientId: string;
  doctorId: string;
  status: SessionStatus;
  scheduledFor: string | null;
  startedAt: string | null;
  expiresAt: string | null;
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

export type AttachmentType = "document" | "image";

/** Mock/local for now — url is a data: URI, not an uploaded-file reference. */
export interface MessageAttachment {
  type: AttachmentType;
  name: string;
  url: string;
}

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  attachment: MessageAttachment | null;
  createdAt: string;
}

export type NotificationType = "request-accepted" | "new-message" | "session-reminder" | "session-cancelled";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  /** e.g. a sessionId — how reminder-generation dedupes so it doesn't re-notify on every check. */
  relatedId: string | null;
  read: boolean;
  createdAt: string;
}
