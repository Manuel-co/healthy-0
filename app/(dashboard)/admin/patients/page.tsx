"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useQueryParams } from "@/hooks/useQueryParams";
import { getAllPatients } from "@/lib/patients-data";
import { getEffectiveStatus, effectiveStatusPriority, type EffectiveStatus } from "@/lib/admin-actions";
import { PatientList } from "@/components/dashboard/PatientList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Patient } from "@/lib/types";

const STATUS_TABS: { value: EffectiveStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "banned", label: "Banned" },
];

function comparePatients(a: Patient, b: Patient, sortBy: string, sortDir: "asc" | "desc"): number {
  let result = 0;
  if (sortBy === "name") {
    result = a.name.localeCompare(b.name);
  } else {
    result = effectiveStatusPriority(a) - effectiveStatusPriority(b);
    if (result === 0) result = a.name.localeCompare(b.name);
  }
  return sortDir === "asc" ? result : -result;
}

function AdminPatientsPageContent() {
  const { user, loading } = useRequireRole("admin");
  const { searchParams, setParams } = useQueryParams();
  const [patients, setPatients] = useState<Patient[]>([]);

  const statusFilter = (searchParams.get("status") as EffectiveStatus | null) ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "name";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc" | null) ?? "asc";

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  useEffect(() => {
    setParams({ q: debouncedSearch || null });
  }, [debouncedSearch, setParams]);

  useEffect(() => {
    if (!user) return;
    getAllPatients().then(setPatients);
  }, [user]);

  function handleSortChange(column: string) {
    if (sortBy === column) {
      setParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      setParams({ sortBy: column, sortDir: "asc" });
    }
  }

  const filteredPatients = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    let list = patients;
    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query));
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => getEffectiveStatus(p) === statusFilter);
    }
    return [...list].sort((a, b) => comparePatients(a, b, sortBy, sortDir));
  }, [patients, debouncedSearch, statusFilter, sortBy, sortDir]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Patients</h1>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>All patients ({filteredPatients.length})</CardTitle>
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
          <PatientList
            patients={filteredPatients}
            basePath="/admin/patients"
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPatientsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPatientsPageContent />
    </Suspense>
  );
}
