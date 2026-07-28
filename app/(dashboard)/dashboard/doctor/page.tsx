"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, MessageSquare, Mail, AlertCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getRequestedAssignmentsForDoctor, type PendingRequest } from "@/lib/doctors-data";
import { acceptAssignment, declineAssignment } from "@/lib/assignments";
import {
  getSessionSummariesForDoctor,
  getDoctorRosterStats,
  getPatientsNeedingAttention,
  type DoctorSessionSummary,
  type DoctorRosterStats,
  type AttentionItem,
} from "@/lib/messaging";
import { PatientList } from "@/components/dashboard/PatientList";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/types";

export default function DoctorDashboardPage() {
  const { user, loading } = useRequireRole("doctor");
  const router = useRouter();
  const [summaries, setSummaries] = useState<DoctorSessionSummary[]>([]);
  const [stats, setStats] = useState<DoctorRosterStats | null>(null);
  const [attention, setAttention] = useState<AttentionItem[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [actingOnId, setActingOnId] = useState<string | null>(null);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  async function refresh() {
    if (!user) return;
    const [summaryList, statsResult, attentionList, requestList] = await Promise.all([
      getSessionSummariesForDoctor(user.id),
      getDoctorRosterStats(user.id),
      getPatientsNeedingAttention(user.id),
      getRequestedAssignmentsForDoctor(user.id),
    ]);
    setSummaries(summaryList);
    setStats(statsResult);
    setAttention(attentionList);
    setRequests(requestList);
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getSessionSummariesForDoctor(user.id),
      getDoctorRosterStats(user.id),
      getPatientsNeedingAttention(user.id),
      getRequestedAssignmentsForDoctor(user.id),
    ]).then(([summaryList, statsResult, attentionList, requestList]) => {
      setSummaries(summaryList);
      setStats(statsResult);
      setAttention(attentionList);
      setRequests(requestList);
      setRosterLoading(false);
    });
  }, [user]);

  async function handleAccept(request: PendingRequest) {
    setActingOnId(request.assignment.id);
    await acceptAssignment(request.assignment.id);
    router.push(`/dashboard/doctor/patients/${request.patient.id}`);
  }

  async function handleDecline(request: PendingRequest) {
    setActingOnId(request.assignment.id);
    await declineAssignment(request.assignment.id);
    await refresh();
    setActingOnId(null);
  }

  const unreadCounts = useMemo(
    () => Object.fromEntries(summaries.map((s) => [s.patient.id, s.unreadCount])),
    [summaries]
  );

  const filteredPatients = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    let list = summaries;
    if (query) {
      list = list.filter(
        (s) => s.patient.name.toLowerCase().includes(query) || s.patient.email.toLowerCase().includes(query)
      );
    }
    return [...list]
      .sort((a, b) => b.unreadCount - a.unreadCount || a.patient.name.localeCompare(b.patient.name))
      .map((s): Patient => s.patient);
  }, [summaries, debouncedSearch]);

  if (loading || !user) return null;
  const displayName = user.name.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">
          Welcome{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">Your assigned patients.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total patients" value={stats?.totalPatients ?? "—"} icon={Users} />
        <StatCard label="Active conversations" value={stats?.activeConversations ?? "—"} icon={MessageSquare} />
        <StatCard label="Unread messages" value={stats?.unreadMessages ?? "—"} icon={Mail} />
      </div>

      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Incoming requests ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.assignment.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#071938]">{request.patient.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={actingOnId === request.assignment.id}
                    onClick={() => handleAccept(request)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingOnId === request.assignment.id}
                    onClick={() => handleDecline(request)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {attention.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-4 text-[#071938]/60" />
              Needs attention ({attention.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attention.map(({ summary, reason, staleDays }) => (
              <div
                key={summary.patient.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <p className="font-medium text-[#071938]">{summary.patient.name}</p>
                  <StatusBadge status={summary.patient.verificationStatus} banned={summary.patient.banned} />
                  <span className="text-xs text-muted-foreground">
                    {reason === "unread"
                      ? `${summary.unreadCount} unread message${summary.unreadCount === 1 ? "" : "s"}`
                      : `No contact in ${staleDays}+ days`}
                  </span>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/doctor/patients/${summary.patient.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>My patients ({filteredPatients.length})</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email"
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <PatientList
            patients={filteredPatients}
            basePath="/dashboard/doctor/patients"
            showEmail={false}
            unreadCounts={unreadCounts}
            loading={rosterLoading}
            emptyState={
              summaries.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-[#071938]">No patients assigned yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Once a patient requests you or is assigned to you, they&apos;ll show up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No patients match your search.</p>
                  <Button size="sm" variant="outline" onClick={() => setSearchInput("")}>
                    Clear search
                  </Button>
                </div>
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
