"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, MessageSquare, ShieldAlert } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPlatformStats, type PlatformStats } from "@/lib/messaging";
import { StatCard } from "@/components/dashboard/StatCard";

export default function AdminOverviewPage() {
  const { user, loading } = useRequireRole("admin");
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    if (!user) return;
    getPlatformStats().then(setStats);
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Platform overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of HealthyZero activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total patients" value={stats?.totalPatients ?? "—"} icon={Users} />
        <StatCard label="Total doctors" value={stats?.totalDoctors ?? "—"} icon={Stethoscope} />
        <StatCard label="Total messages" value={stats?.totalMessages ?? "—"} icon={MessageSquare} />
        <StatCard label="Pending verifications" value={stats?.pendingVerifications ?? "—"} icon={ShieldAlert} />
      </div>
    </div>
  );
}
