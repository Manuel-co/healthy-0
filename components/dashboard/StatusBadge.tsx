import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/types";

export function StatusBadge({ status, banned }: { status: VerificationStatus; banned: boolean }) {
  if (banned) return <Badge variant="destructive">Banned</Badge>;
  if (status === "verified") return <Badge className="bg-[#071938]">Verified</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}
