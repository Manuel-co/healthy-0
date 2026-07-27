"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getPendingVerifications } from "@/lib/admin-actions";
import { VerificationActions } from "@/components/dashboard/VerificationActions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import type { Doctor, Patient } from "@/lib/types";

function Row({ item, onChange }: { item: Patient | Doctor; onChange: () => void }) {
  const detailPath = item.role === "doctor" ? `/admin/doctors/${item.id}` : `/admin/patients/${item.id}`;
  const avatarUrl = item.role === "doctor" ? item.profileImageUrl : null;

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={item.name} />}
            <AvatarFallback>{initials(item.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#071938]">{item.name}</p>
              <Badge variant="outline" className="capitalize">
                {item.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <Link href={detailPath} className="text-xs font-medium text-[#071938] underline underline-offset-2">
          View full profile
        </Link>
      </div>
      <div className="mt-3">
        <VerificationActions
          userId={item.id}
          status={item.verificationStatus}
          banned={item.banned}
          rejectionReason={item.rejectionReason}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-2.5 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PendingVerificationsSection({ onChange }: { onChange?: () => void }) {
  const [items, setItems] = useState<(Patient | Doctor)[] | null>(null);

  useEffect(() => {
    getPendingVerifications().then(setItems);
  }, []);

  async function refresh() {
    setItems(await getPendingVerifications());
    onChange?.();
  }

  return (
    <Card id="pending-verifications" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Pending verifications{items && items.length > 0 ? ` (${items.length})` : ""}</CardTitle>
        <CardDescription>New doctor and patient accounts awaiting review.</CardDescription>
      </CardHeader>
      <CardContent>
        {items === null ? (
          <QueueSkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="size-8 text-[#4c7a2f]" />
            <p className="text-sm font-medium text-[#071938]">All caught up</p>
            <p className="text-xs text-muted-foreground">No accounts are waiting on review right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Row key={item.id} item={item} onChange={refresh} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
