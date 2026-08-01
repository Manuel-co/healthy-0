"use client";

import { useState } from "react";
import { FocusAreaPicker } from "@/components/FocusAreaPicker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { saveIntake } from "@/lib/patients-data";
import type { Patient, UrgencyLevel } from "@/lib/types";

const NO_PREFERENCE = "__none__";
const LANGUAGE_OPTIONS = ["English", "Yoruba", "Igbo", "Hausa", "French", "Pidgin"];
const URGENCY_OPTIONS: { value: UrgencyLevel; label: string }[] = [
  { value: "low", label: "Low — just exploring" },
  { value: "medium", label: "Medium — would like to start soon" },
  { value: "high", label: "High — I need support soon" },
];

interface IntakeFormProps {
  patient: Patient;
  onSaved: (patient: Patient) => void;
}

/** The find-a-doctor intake — feeds lib/matching.ts. Persists via lib/patients-data.ts; re-submitting updates the patient's matching info and re-runs matching (see the doctors page). */
export function IntakeForm({ patient, onSaved }: IntakeFormProps) {
  const [presentingConcern, setPresentingConcern] = useState(patient.presentingConcern);
  const [focusAreas, setFocusAreas] = useState<string[]>(patient.intake?.focusAreas ?? []);
  const [preferredLanguage, setPreferredLanguage] = useState(patient.intake?.preferredLanguage ?? NO_PREFERENCE);
  const [urgency, setUrgency] = useState<string>(patient.intake?.urgency ?? NO_PREFERENCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (focusAreas.length === 0) {
      setError("Pick at least one focus area so we can match you.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await saveIntake(patient.id, {
        presentingConcern,
        focusAreas,
        preferredLanguage: preferredLanguage === NO_PREFERENCE ? null : preferredLanguage,
        urgency: urgency === NO_PREFERENCE ? null : (urgency as UrgencyLevel),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that — try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>What's on your mind?</Label>
        <Textarea
          value={presentingConcern}
          onChange={(e) => setPresentingConcern(e.target.value)}
          placeholder="Tell us a little about what you're going through — your doctor will read this."
          rows={4}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Focus areas</Label>
        <p className="text-xs text-muted-foreground">Pick everything that applies — this drives your matches.</p>
        <FocusAreaPicker value={focusAreas} onChange={setFocusAreas} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Preferred language</Label>
          <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PREFERENCE}>No preference</SelectItem>
              {LANGUAGE_OPTIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>How urgent is this? (optional)</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PREFERENCE}>Prefer not to say</SelectItem>
              {URGENCY_OPTIONS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button disabled={submitting} onClick={handleSubmit}>
        {submitting ? "Matching..." : "Find my doctor"}
      </Button>
    </div>
  );
}
