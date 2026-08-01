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
import { Button } from "@/components/ui/button";
import { changeSubscriptionTier, type PlanConfig } from "@/lib/plans";
import type { Patient } from "@/lib/types";

interface ChangePlanDialogProps {
  patientId: string;
  targetPlan: PlanConfig;
  direction: "upgrade" | "downgrade";
  trigger: ReactNode;
  onChanged: (patient: Patient) => void;
}

/** Mock checkout — confirms the switch, no real payment gateway. */
export function ChangePlanDialog({ patientId, targetPlan, direction, trigger, onChanged }: ChangePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const patient = await changeSubscriptionTier(patientId, targetPlan.tier);
      onChanged(patient);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change your plan.");
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{direction === "upgrade" ? "Upgrade" : "Downgrade"} to {targetPlan.name}</DialogTitle>
          <DialogDescription>
            Takes effect immediately — {targetPlan.sessionsPerMonth} sessions/month at {targetPlan.sessionLengthMins}{" "}
            minutes each. This is a mock checkout; no payment is actually processed.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={submitting} onClick={handleConfirm}>
            {submitting ? "Processing payment..." : `Confirm ${direction}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
