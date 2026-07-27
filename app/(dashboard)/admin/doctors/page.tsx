"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useQueryParams } from "@/hooks/useQueryParams";
import { getAllDoctors, getPatientsForDoctor } from "@/lib/doctors-data";
import { getEffectiveStatus, effectiveStatusPriority, type EffectiveStatus } from "@/lib/admin-actions";
import { DoctorList } from "@/components/dashboard/DoctorList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Doctor } from "@/lib/types";

const STATUS_TABS: { value: EffectiveStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "banned", label: "Banned" },
];

function compareDoctors(
  a: Doctor,
  b: Doctor,
  sortBy: string,
  sortDir: "asc" | "desc",
  patientCounts: Record<string, number>
): number {
  let result = 0;
  if (sortBy === "name") {
    result = a.name.localeCompare(b.name);
  } else if (sortBy === "patients") {
    result = (patientCounts[a.id] ?? 0) - (patientCounts[b.id] ?? 0);
  } else {
    result = effectiveStatusPriority(a) - effectiveStatusPriority(b);
    if (result === 0) result = a.name.localeCompare(b.name);
  }
  return sortDir === "asc" ? result : -result;
}

function AdminDoctorsPageContent() {
  const { user, loading } = useRequireRole("admin");
  const { searchParams, setParams } = useQueryParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientCounts, setPatientCounts] = useState<Record<string, number>>({});

  const statusFilter = (searchParams.get("status") as EffectiveStatus | null) ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "status";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc" | null) ?? "asc";

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  useEffect(() => {
    setParams({ q: debouncedSearch || null });
  }, [debouncedSearch, setParams]);

  useEffect(() => {
    if (!user) return;
    getAllDoctors().then(async (allDoctors) => {
      setDoctors(allDoctors);
      const counts = await Promise.all(
        allDoctors.map(async (doctor) => [doctor.id, (await getPatientsForDoctor(doctor.id)).length] as const)
      );
      setPatientCounts(Object.fromEntries(counts));
    });
  }, [user]);

  function handleSortChange(column: string) {
    if (sortBy === column) {
      setParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      setParams({ sortBy: column, sortDir: "asc" });
    }
  }

  const filteredDoctors = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    let list = doctors;
    if (query) {
      list = list.filter((d) => d.name.toLowerCase().includes(query) || d.email.toLowerCase().includes(query));
    }
    if (statusFilter !== "all") {
      list = list.filter((d) => getEffectiveStatus(d) === statusFilter);
    }
    return [...list].sort((a, b) => compareDoctors(a, b, sortBy, sortDir, patientCounts));
  }, [doctors, debouncedSearch, statusFilter, sortBy, sortDir, patientCounts]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Doctors</h1>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>All doctors ({filteredDoctors.length})</CardTitle>
            <Tabs value={statusFilter} onValueChange={(v) => setParams({ status: v === "all" ? null : v })}>
              <TabsList>
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
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
          <DoctorList
            doctors={filteredDoctors}
            basePath="/admin/doctors"
            patientCounts={patientCounts}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDoctorsPage() {
  return (
    <Suspense fallback={null}>
      <AdminDoctorsPageContent />
    </Suspense>
  );
}
