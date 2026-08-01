/**
 * The single controlled focus-area vocabulary. Both doctor profiles
 * (Doctor.focusAreas) and patient intake (Patient.intake.focusAreas) are
 * meant to draw from this exact list, so matching in lib/matching.ts is a
 * plain set intersection, not fuzzy string comparison.
 *
 * Proposed set for a general mental-health telehealth platform — flag any
 * additions/renames and I'll thread them through (seed data + this list).
 * Doctor signup currently free-types focus areas as comma-separated text,
 * so match quality still depends on doctors entering values that match this
 * list until that form is switched to pick from it too.
 */
export const FOCUS_AREAS = [
  "Anxiety",
  "Depression",
  "Trauma",
  "Stress",
  "Grief",
  "Relationships",
  "Bipolar disorder",
  "Medication management",
  "Sleep",
  "Self-esteem",
  "Anger management",
  "Substance use",
] as const;

export type FocusArea = (typeof FOCUS_AREAS)[number];
