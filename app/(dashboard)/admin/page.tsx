"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, MessageSquare, ShieldAlert } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPlatformStats, type PlatformStats } from "@/lib/messaging";
import { StatCard } from "@/components/dashboard/StatCard";
import { PendingVerificationsSection } from "@/components/dashboard/PendingVerificationsSection";

function weeklyTrend(count: number): string | undefined {
  return count > 0 ? `+${count} this week` : undefined;
}

export default function AdminOverviewPage() {
  const { user, loading } = useRequireRole("admin");
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    if (!user) return;
    getPlatformStats().then(setStats);
  }, [user]);

  function refreshStats() {
    getPlatformStats().then(setStats);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Platform overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of HealthyZero activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total patients"
          value={stats?.totalPatients ?? "—"}
          icon={Users}
          href="/admin/patients"
          trend={stats ? weeklyTrend(stats.trends.newPatientsThisWeek) : undefined}
        />
        <StatCard
          label="Total doctors"
          value={stats?.totalDoctors ?? "—"}
          icon={Stethoscope}
          href="/admin/doctors"
          trend={stats ? weeklyTrend(stats.trends.newDoctorsThisWeek) : undefined}
        />
        <StatCard
          label="Total messages"
          value={stats?.totalMessages ?? "—"}
          icon={MessageSquare}
          trend={stats ? weeklyTrend(stats.trends.newMessagesThisWeek) : undefined}
        />
        <StatCard
          label="Pending verifications"
          value={stats?.pendingVerifications ?? "—"}
          icon={ShieldAlert}
          href="/admin#pending-verifications"
          trend={stats ? weeklyTrend(stats.trends.newPendingThisWeek) : undefined}
        />
      </div>

      <PendingVerificationsSection onChange={refreshStats} />
    </div>
  );
}
