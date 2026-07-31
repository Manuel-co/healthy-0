import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PRICING_PATH } from "@/lib/routes";

export function OutOfSessionsNotice() {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground">Out of sessions this month — upgrade for more.</p>
      <Button asChild size="sm" variant="outline">
        <Link href={PRICING_PATH}>View plans</Link>
      </Button>
    </div>
  );
}
