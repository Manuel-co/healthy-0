"use client";

import { useState, type ReactNode } from "react";
import { Video, PhoneOff } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VideoCallDialogProps {
  otherPartyName: string;
  trigger: ReactNode;
}

/** Placeholder entry point — gating + UI only, no real media stack yet (later phase). */
export function VideoCallDialog({ otherPartyName, trigger }: VideoCallDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Video call with {otherPartyName}</DialogTitle>
          <DialogDescription>Available on the Max plan. Real-time video is coming soon.</DialogDescription>
        </DialogHeader>
        <div className="flex aspect-video items-center justify-center rounded-xl bg-[#071938]">
          <Video className="size-10 text-white/30" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            <PhoneOff className="size-4" />
            End call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
