import { ShieldAlert, ShieldX } from "lucide-react";
import type { VerificationStatus } from "@/lib/types";

interface VerificationBannerProps {
  status: VerificationStatus;
  rejectionReason?: string | null;
}

export function VerificationBanner({ status, rejectionReason }: VerificationBannerProps) {
  if (status === "verified") return null;

  if (status === "rejected") {
    return (
      <div className="mb-6 flex items-start gap-2.5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <ShieldX className="size-4 shrink-0 mt-0.5" />
        <p>
          Your identity verification was rejected.
          {rejectionReason && (
            <>
              {" "}
              <span className="font-medium">Reason: </span>
              {rejectionReason}
            </>
          )}{" "}
          Please contact support or update your details to resubmit.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-[#e7f1a8]/60 px-4 py-3 text-sm text-[#071938]">
      <ShieldAlert className="size-4 shrink-0" />
      Your account is pending identity verification by a HealthyZero admin. Messaging is disabled until you&apos;re verified.
    </div>
  );
}
