import { getUsers } from "@/lib/auth/mock-db";
import { createNotification } from "@/lib/notifications-data";
import type { Assignment, AssignmentStatus, Doctor } from "@/lib/types";

const ASSIGNMENTS_KEY = "hz_assignments";

function seedAssignments(): Assignment[] {
  return [
    {
      id: "assignment-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      status: "active",
      createdAt: "2026-01-15T09:00:00.000Z",
      updatedAt: "2026-01-15T09:00:00.000Z",
    },
    {
      id: "assignment-2",
      patientId: "patient-2",
      doctorId: "doctor-1",
      status: "active",
      createdAt: "2026-01-18T09:00:00.000Z",
      updatedAt: "2026-01-18T09:00:00.000Z",
    },
  ];
}

function readAssignments(): Assignment[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
  if (!raw) {
    const seeded = seedAssignments();
    window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw) as Assignment[];
}

function writeAssignments(assignments: Assignment[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export async function getAssignmentsForPatient(patientId: string): Promise<Assignment[]> {
  return readAssignments().filter((a) => a.patientId === patientId);
}

export async function getAssignmentsForDoctor(doctorId: string, status?: AssignmentStatus): Promise<Assignment[]> {
  return readAssignments().filter((a) => a.doctorId === doctorId && (!status || a.status === status));
}

/** The most relevant assignment for a patient/doctor pair — active over requested over most recent. */
export async function getAssignmentForPair(patientId: string, doctorId: string): Promise<Assignment | null> {
  const related = readAssignments().filter((a) => a.patientId === patientId && a.doctorId === doctorId);
  if (related.length === 0) return null;
  return (
    related.find((a) => a.status === "active") ??
    related.find((a) => a.status === "requested") ??
    [...related].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  );
}

export async function getActiveAssignmentForPatient(patientId: string): Promise<Assignment | null> {
  const assignment = readAssignments().find((a) => a.patientId === patientId && a.status === "active");
  return assignment ?? null;
}

/**
 * Pure data-layer create — does not enforce the "one active/requested
 * assignment per patient at a time" rule. That guard belongs to the request
 * flow that calls this (see Phase 3), not to the store itself.
 */
export async function createAssignment(
  patientId: string,
  doctorId: string,
  status: AssignmentStatus = "requested"
): Promise<Assignment> {
  const now = new Date().toISOString();
  const assignment: Assignment = { id: `assignment-${Date.now()}`, patientId, doctorId, status, createdAt: now, updatedAt: now };
  writeAssignments([...readAssignments(), assignment]);
  return assignment;
}

export async function updateAssignmentStatus(id: string, status: AssignmentStatus): Promise<void> {
  const assignments = readAssignments();
  const index = assignments.findIndex((a) => a.id === id);
  if (index === -1) return;
  assignments[index] = { ...assignments[index], status, updatedAt: new Date().toISOString() };
  writeAssignments(assignments);
}

/**
 * Patient-initiated request from the doctor directory. Idempotent for a given
 * patient/doctor pair — re-clicking "Request" on the same doctor returns the
 * existing requested/active assignment instead of creating a duplicate.
 *
 * Enforces "at most one active-or-requested assignment per patient": if the
 * patient currently occupies that slot with a DIFFERENT doctor, this is a
 * switch — the old assignment is ended and a fresh request is created for
 * the new doctor.
 */
export async function requestAssignment(patientId: string, doctorId: string): Promise<Assignment> {
  const existing = readAssignments().find(
    (a) => a.patientId === patientId && a.doctorId === doctorId && (a.status === "requested" || a.status === "active")
  );
  if (existing) return existing;

  const doctor = getUsers().find((u): u is Doctor => u.role === "doctor" && u.id === doctorId);
  if (!doctor) throw new Error("Doctor not found.");
  if (!doctor.acceptingNewPatients) {
    throw new Error(`${doctor.name} isn't accepting new patients right now.`);
  }

  const current = readAssignments().find(
    (a) => a.patientId === patientId && a.doctorId !== doctorId && (a.status === "active" || a.status === "requested")
  );
  if (current) {
    await updateAssignmentStatus(current.id, "ended");
  }

  return createAssignment(patientId, doctorId, "requested");
}

/**
 * Doctor accepts an incoming request. Also implements "switching": ends any
 * other active assignment the patient has (defensive — requestAssignment's
 * guard should already prevent this from existing, but accept is the moment
 * a new doctor relationship truly begins, so it's the right place to make
 * sure nothing stale is left active).
 */
export async function acceptAssignment(assignmentId: string): Promise<Assignment | null> {
  const assignments = readAssignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment || assignment.status !== "requested") return null;

  const staleActive = assignments.filter(
    (a) => a.patientId === assignment.patientId && a.status === "active" && a.id !== assignment.id
  );
  for (const stale of staleActive) {
    await updateAssignmentStatus(stale.id, "ended");
  }

  await updateAssignmentStatus(assignmentId, "active");

  const doctor = getUsers().find((u): u is Doctor => u.role === "doctor" && u.id === assignment.doctorId);
  if (doctor) {
    await createNotification(
      assignment.patientId,
      "request-accepted",
      "Request accepted",
      `${doctor.name} accepted your request. Say hello!`,
      "/dashboard/patient",
      assignment.id
    );
  }

  return { ...assignment, status: "active" };
}

export async function declineAssignment(assignmentId: string): Promise<void> {
  await updateAssignmentStatus(assignmentId, "declined");
}
