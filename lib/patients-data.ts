import { getUsers, updateUser } from "@/lib/auth/mock-db";
import { getActiveAssignmentForPatient } from "@/lib/assignments";
import type { Doctor, Patient } from "@/lib/types";

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
