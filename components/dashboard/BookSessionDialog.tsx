"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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

function todayISODate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Every half-hour of the day, e.g. "09:00", "09:30" — the slot picker paired with the date Calendar. */
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

function formatTimeLabel(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSlots = useMemo(() => {
    if (date !== todayISODate()) return TIME_SLOTS;
    const now = new Date();
    const cutoff = now.getHours() * 60 + now.getMinutes();
    return TIME_SLOTS.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h * 60 + m > cutoff;
    });
  }, [date]);

  function handleDateChange(value: string) {
    setDate(value);
    setTime("");
  }

  async function handleSubmit() {
    if (!date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const session = await scheduleSession(patientId, doctorId, new Date(`${date}T${time}`).toISOString());
      onBooked(session);
      setOpen(false);
      setDate("");
      setTime("");
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="scheduledDate">Date</Label>
            <DatePicker
              id="scheduledDate"
              value={date}
              onChange={handleDateChange}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              placeholder="Select date"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scheduledTime">Time</Label>
            <Select value={time} onValueChange={setTime} disabled={!date}>
              <SelectTrigger id="scheduledTime" className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">No slots left today</p>
                ) : (
                  availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {formatTimeLabel(slot)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!date || !time || submitting} onClick={handleSubmit}>
            {submitting ? "Booking..." : "Book session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
