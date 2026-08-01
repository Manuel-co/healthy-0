import { getVerifiedDoctors } from "@/lib/doctors-data";
import {
  getAssignmentsForDoctor,
  getAssignmentsForPatient,
  createAssignment,
  updateAssignmentStatus,
  requestAssignment,
} from "@/lib/assignments";
import { setUnmatchedFlag } from "@/lib/patients-data";
import { getEntitlements } from "@/lib/plans";
import type { Assignment, Doctor, Patient } from "@/lib/types";

export interface MatchInput {
  focusAreas: string[];
  preferredLanguage: string | null;
}

export interface MatchResult {
  doctor: Doctor;
  /** Overlapping focus areas — the human-readable "why matched" for the UI. */
  matchReason: string[];
  languageMatch: boolean;
  currentLoad: number;
}

/**
 * Candidate pool is always verified + accepting-new-patients doctors. Ranked
 * by focus-area overlap (primary), then language match, then lightest
 * current active-patient load — so the top result is always a genuine
 * best fit, never a random pick. This same ranking powers both the Basic
 * auto-match and the Pro/Max shortlist (Phase 4), so there's exactly one
 * notion of "best doctor for this patient" in the whole app.
 *
 * When nobody shares a focus area, every candidate ties at 0 and the sort
 * falls through to load-balancing — the top pick becomes "least-loaded
 * verified doctor accepting patients," which doubles as the Phase 5
 * no-match fallback without any separate code path.
 */
export async function getMatchingDoctors(intake: MatchInput): Promise<MatchResult[]> {
  const doctors = (await getVerifiedDoctors()).filter((d) => d.acceptingNewPatients);
  const wantedFocusAreas = new Set(intake.focusAreas);

  const results = await Promise.all(
    doctors.map(async (doctor): Promise<MatchResult> => {
      const matchReason = doctor.focusAreas.filter((area) => wantedFocusAreas.has(area));
      const languageMatch = !!intake.preferredLanguage && doctor.languages.includes(intake.preferredLanguage);
      const currentLoad = (await getAssignmentsForDoctor(doctor.id, "active")).length;
      return { doctor, matchReason, languageMatch, currentLoad };
    })
  );

  return results.sort((a, b) => {
    if (b.matchReason.length !== a.matchReason.length) return b.matchReason.length - a.matchReason.length;
    if (a.languageMatch !== b.languageMatch) return a.languageMatch ? -1 : 1;
    return a.currentLoad - b.currentLoad;
  });
}

/**
 * Phase 4 gate. The only lib entrypoint a patient can use to hand-pick a
 * doctor — Basic patients get no picker in the UI, but this is the backstop
 * that makes that a real rule and not just a disabled button: even a direct
 * call bypassing the UI is rejected here.
 */
export async function requestMatchedDoctor(patient: Patient, doctorId: string): Promise<Assignment> {
  if (!getEntitlements(patient).canChooseDoctor) {
    throw new Error("Your plan matches you with a doctor automatically — upgrade to Pro or Max to choose your own.");
  }
  return requestAssignment(patient.id, doctorId);
}

export interface AutoAssignResult {
  assignment: Assignment;
  match: MatchResult;
  /** False when the top pick shares no focus area with the patient — the Phase 5 fallback case. */
  hadFocusOverlap: boolean;
}

/**
 * Phase 4 Basic-tier flow: rank matches, then assign the top pick directly
 * as active — no request/accept step, since the system (not the patient)
 * made the choice and the doctor already opted in via acceptingNewPatients.
 *
 * Ends any prior active/requested assignment first — re-running the intake
 * after already being assigned is the switch-doctor case. Session history
 * is unaffected either way; Sessions aren't cascaded from Assignments, so
 * prior threads stay readable regardless of which doctor is active now.
 *
 * When the top pick shares no focus area with the patient (nobody in the
 * verified+accepting pool matched), it's still the least-loaded doctor —
 * assigning it beats leaving the patient with nothing, but the patient is
 * flagged for admin review instead of being told it's a confident match
 * (see UnmatchedFlag). A later re-match with real overlap clears the flag.
 */
export async function autoAssignBestMatch(patient: Patient): Promise<AutoAssignResult> {
  if (!patient.intake) throw new Error("Complete the intake form first.");

  const matches = await getMatchingDoctors(patient.intake);
  if (matches.length === 0) {
    throw new Error("No doctors are available to match with right now — please try again shortly.");
  }
  const top = matches[0];
  const hadFocusOverlap = top.matchReason.length > 0;

  const current = (await getAssignmentsForPatient(patient.id)).find(
    (a) => a.status === "active" || a.status === "requested"
  );

  let assignment: Assignment;
  if (current && current.doctorId === top.doctor.id) {
    if (current.status !== "active") await updateAssignmentStatus(current.id, "active");
    assignment = { ...current, status: "active" };
  } else {
    if (current) await updateAssignmentStatus(current.id, "ended");
    assignment = await createAssignment(patient.id, top.doctor.id, "active");
  }

  await setUnmatchedFlag(
    patient.id,
    hadFocusOverlap
      ? null
      : {
          reason: `Auto-matched with no focus-area overlap (patient's intake: ${
            patient.intake.focusAreas.join(", ") || "none selected"
          }). Assigned to ${top.doctor.name} as the least-loaded verified doctor accepting patients.`,
          flaggedAt: new Date().toISOString(),
        }
  );

  return { assignment, match: top, hadFocusOverlap };
}
