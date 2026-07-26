"use client";

import { useState } from "react";
import { verifyUser, rejectUser, banUser, unbanUser } from "@/lib/admin-actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { VerificationStatus } from "@/lib/types";

interface VerificationActionsProps {
  userId: string;
  status: VerificationStatus;
  banned: boolean;
  rejectionReason: string | null;
  onChange: () => void;
}

export function VerificationActions({ userId, status, banned, rejectionReason, onChange }: VerificationActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function run(action: (id: string) => Promise<void>) {
    await action(userId);
    onChange();
  }

  async function handleConfirmReject() {
    if (!reason.trim()) return;
    setSubmitting(true);
    await rejectUser(userId, reason.trim());
    setSubmitting(false);
    setRejectOpen(false);
    setReason("");
    onChange();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} banned={banned} />
        {status !== "verified" && (
          <Button size="sm" onClick={() => run(verifyUser)}>
            Approve
          </Button>
        )}
        {status !== "rejected" && (
          <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}>
            Reject
          </Button>
        )}
        {banned ? (
          <Button size="sm" variant="outline" onClick={() => run(unbanUser)}>
            Unban
          </Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={() => run(banUser)}>
            Ban
          </Button>
        )}
      </div>

      {status === "rejected" && rejectionReason && (
        <p className="text-sm text-destructive">
          <span className="font-medium">Rejection reason: </span>
          {rejectionReason}
        </p>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this account</DialogTitle>
            <DialogDescription>
              Let them know what needs to be fixed. This reason is shown on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rejection-reason">Reason</Label>
            <Textarea
              id="rejection-reason"
              required
              placeholder="e.g. The uploaded ID document is unreadable — please re-upload a clear photo."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" disabled={!reason.trim() || submitting} onClick={handleConfirmReject}>
              {submitting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
