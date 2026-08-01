import { getVerifiedDoctors } from "@/lib/doctors-data";
import { getAssignmentsForDoctor } from "@/lib/assignments";
import type { Doctor } from "@/lib/types";

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
