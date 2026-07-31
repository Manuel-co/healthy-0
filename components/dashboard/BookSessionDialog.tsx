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
import { Button } from "@/components/ui/button";
import { scheduleSession } from "@/lib/sessions-data";
import type { Session } from "@/lib/types";

interface BookSessionDialogProps {
  patientId: string;
  doctorId: string;
  doctorName: string;
  sessionLengthMins: number;
  trigger: ReactNode;
  onBooked: (session: Session) => void;
}

function minDateTimeLocal(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function BookSessionDialog({
  patientId,
  doctorId,
  doctorName,
  sessionLengthMins,
  trigger,
  onBooked,
}: BookSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!value) return;
    setSubmitting(true);
    setError(null);
    try {
      const session = await scheduleSession(patientId, doctorId, new Date(value).toISOString());
      onBooked(session);
      setOpen(false);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't book that session.");
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a session</DialogTitle>
          <DialogDescription>
            Pick a time to meet with {doctorName}. You&apos;ll get a {sessionLengthMins}-minute window starting then.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="scheduledFor">Date &amp; time</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            min={minDateTimeLocal()}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!value || submitting} onClick={handleSubmit}>
            {submitting ? "Booking..." : "Book session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
