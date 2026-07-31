import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "@/lib/types";

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-[#071938]">Active</Badge>;
    case "scheduled":
      return <Badge variant="secondary">Scheduled</Badge>;
    case "completed":
      return <Badge variant="outline">Ended</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "no-show":
      return <Badge variant="destructive">No-show</Badge>;
  }
}
