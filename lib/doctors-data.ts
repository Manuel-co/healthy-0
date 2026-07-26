import { getUsers } from "@/lib/auth/mock-db";
import { getAssignmentsForDoctor } from "@/lib/assignments";
import type { Assignment, Doctor, Patient } from "@/lib/types";

export async function getAllDoctors(): Promise<Doctor[]> {
  return getUsers().filter((u): u is Doctor => u.role === "doctor");
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  return getUsers().find((u): u is Doctor => u.role === "doctor" && u.id === id);
}

export async function getVerifiedDoctors(): Promise<Doctor[]> {
  const doctors = await getAllDoctors();
  return doctors.filter((d) => d.verificationStatus === "verified" && !d.banned);
}

export async function getPatientsForDoctor(doctorId: string): Promise<Patient[]> {
  const activeAssignments = await getAssignmentsForDoctor(doctorId, "active");
  const patientIds = new Set(activeAssignments.map((a) => a.patientId));
  const users = getUsers();
  return users.filter((u): u is Patient => u.role === "patient" && patientIds.has(u.id));
}

export interface PendingRequest {
  assignment: Assignment;
  patient: Patient;
}

export async function getRequestedAssignmentsForDoctor(doctorId: string): Promise<PendingRequest[]> {
  const requested = await getAssignmentsForDoctor(doctorId, "requested");
  const users = getUsers();
  return requested.flatMap((assignment) => {
    const patient = users.find((u): u is Patient => u.role === "patient" && u.id === assignment.patientId);
    return patient ? [{ assignment, patient }] : [];
  });
}

/**
 * Fallback assignment used only when a patient completes onboarding without
 * requesting a doctor themselves (see the patient-led discovery/request flow).
 * Only considers verified, non-banned doctors, and picks whoever currently
 * has the fewest active patients.
 */
export async function pickFallbackDoctor(): Promise<Doctor | undefined> {
  const doctors = await getVerifiedDoctors();
  if (doctors.length === 0) return undefined;
  const withCounts = await Promise.all(
    doctors.map(async (doctor) => ({
      doctor,
      count: (await getAssignmentsForDoctor(doctor.id, "active")).length,
    }))
  );
  return withCounts.sort((a, b) => a.count - b.count)[0]?.doctor;
}
