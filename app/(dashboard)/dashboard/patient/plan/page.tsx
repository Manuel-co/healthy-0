"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangePlanDialog } from "@/components/dashboard/ChangePlanDialog";
import { PLAN_CONFIG, PLAN_RANK, formatPlanPrice, planFeatures } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { Patient } from "@/lib/types";

export default function PatientPlanPage() {
  const { user, loading } = useRequireRole("patient");
  const [patientOverride, setPatientOverride] = useState<Patient | null>(null);

  if (loading || !user) return null;
  const patient = patientOverride ?? (user as Patient);
  const currentTier = patient.subscription.tier;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">My plan</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re on the {PLAN_CONFIG[currentTier].name} plan. Upgrades and downgrades take effect immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.values(PLAN_CONFIG).map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const direction = PLAN_RANK[plan.tier] > PLAN_RANK[currentTier] ? "upgrade" : "downgrade";
          return (
            <Card key={plan.tier} className={cn(isCurrent && "ring-2 ring-[#071938]")}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current plan</Badge>}
                </div>
                <CardDescription>{formatPlanPrice(plan.price)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {planFeatures(plan).map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5 text-[#071938]">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[#071938]/50" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Current plan
                  </Button>
                ) : (
                  <ChangePlanDialog
                    patientId={patient.id}
                    targetPlan={plan}
                    direction={direction}
                    onChanged={setPatientOverride}
                    trigger={
                      <Button size="sm" variant={direction === "upgrade" ? "default" : "outline"} className="w-full">
                        {direction === "upgrade" ? "Upgrade" : "Downgrade"}
                      </Button>
                    }
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
