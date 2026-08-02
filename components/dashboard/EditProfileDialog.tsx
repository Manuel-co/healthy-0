"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updatePatientProfile } from "@/lib/patients-data";
import type { Patient } from "@/lib/types";

interface EditProfileDialogProps {
  patient: Patient;
  trigger: ReactNode;
  onSaved: (patient: Patient) => void;
}

export function EditProfileDialog({ patient, trigger, onSaved }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(patient.name);
  const [dob, setDob] = useState(patient.dob);
  const [presentingConcern, setPresentingConcern] = useState(patient.presentingConcern);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(patient.name);
      setDob(patient.dob);
      setPresentingConcern(patient.presentingConcern);
      setError(null);
    }
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updatePatientProfile(patient.id, {
        name: name.trim(),
        dob,
        presentingConcern: presentingConcern.trim(),
      });
      onSaved(updated);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile.");
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Your doctor sees your reason for care to help prepare for sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Full name</Label>
            <Input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-dob">Date of birth</Label>
            <DatePicker
              id="edit-dob"
              value={dob}
              onChange={setDob}
              disabled={(date) => date > new Date()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-concern">Reason for care</Label>
            <Textarea
              id="edit-concern"
              rows={3}
              value={presentingConcern}
              onChange={(e) => setPresentingConcern(e.target.value)}
              placeholder="What brings you to HealthyZero?"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!name.trim() || submitting} onClick={handleSubmit}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
