import { getUsers, updateUser } from "@/lib/auth/mock-db";
import { getActiveAssignmentForPatient } from "@/lib/assignments";
import type { Doctor, Intake, Patient, UnmatchedFlag, UrgencyLevel } from "@/lib/types";

export async function getAllPatients(): Promise<Patient[]> {
  return getUsers().filter((u): u is Patient => u.role === "patient");
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  return getUsers().find((u): u is Patient => u.role === "patient" && u.id === id);
}

export async function getDoctorForPatient(patientId: string): Promise<Doctor | null> {
  const assignment = await getActiveAssignmentForPatient(patientId);
  if (!assignment) return null;
  const users = getUsers();
  return users.find((u): u is Doctor => u.role === "doctor" && u.id === assignment.doctorId) ?? null;
}

export interface PatientProfileUpdate {
  name?: string;
  dob?: string;
  presentingConcern?: string;
}

/** Patient self-service edit — email is intentionally not editable here. */
export async function updatePatientProfile(patientId: string, updates: PatientProfileUpdate): Promise<Patient> {
  updateUser(patientId, updates);
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Patient not found.");
  return patient;
}

export interface IntakeFormInput {
  presentingConcern: string;
  focusAreas: string[];
  preferredLanguage: string | null;
  urgency: UrgencyLevel | null;
}

/**
 * Saves the find-a-doctor intake (and the presentingConcern captured
 * alongside it). Re-runnable — a patient can resubmit to update their
 * matching info at any time, editable later from their profile. Pure
 * persistence only: this does NOT run matching or touch assignments, so it
 * has no opinion on tier gating — see lib/matching.ts and the doctors page
 * for what happens with the saved intake.
 */
export async function saveIntake(patientId: string, input: IntakeFormInput): Promise<Patient> {
  const intake: Intake = {
    focusAreas: input.focusAreas,
    preferredLanguage: input.preferredLanguage,
    urgency: input.urgency,
    completedAt: new Date().toISOString(),
  };
  updateUser(patientId, { presentingConcern: input.presentingConcern, intake });
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Patient not found.");
  return patient;
}

/** Set/clear the Phase 5 no-focus-match admin-review flag — see UnmatchedFlag. */
export async function setUnmatchedFlag(patientId: string, flag: UnmatchedFlag | null): Promise<void> {
  updateUser(patientId, { unmatchedFlag: flag });
}
