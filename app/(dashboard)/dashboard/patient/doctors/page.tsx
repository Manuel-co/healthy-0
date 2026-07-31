"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getVerifiedDoctors } from "@/lib/doctors-data";
import { getAssignmentsForPatient, requestAssignment } from "@/lib/assignments";
import { DoctorList } from "@/components/dashboard/DoctorList";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Assignment, Doctor } from "@/lib/types";

const ALL = "__all__";

function DoctorDirectorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-48" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PatientDoctorDirectoryPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [specialty, setSpecialty] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [verifiedDoctors, patientAssignments] = await Promise.all([
      getVerifiedDoctors(),
      getAssignmentsForPatient(user.id),
    ]);
    setDoctors(verifiedDoctors);
    setAssignments(patientAssignments);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getVerifiedDoctors(), getAssignmentsForPatient(user.id)]).then(
      ([verifiedDoctors, patientAssignments]) => {
        setDoctors(verifiedDoctors);
        setAssignments(patientAssignments);
        setDataLoading(false);
      }
    );
  }, [user]);

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean))).sort(),
    [doctors]
  );
  const languages = useMemo(
    () => Array.from(new Set(doctors.flatMap((d) => d.languages ?? []).filter(Boolean))).sort(),
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      if (specialty !== ALL && doctor.specialty !== specialty) return false;
      if (language !== ALL && !doctor.languages.includes(language)) return false;
      if (onlyAvailable && !doctor.acceptingNewPatients) return false;
      return true;
    });
  }, [doctors, specialty, language, onlyAvailable]);

  async function handleRequest(doctorId: string) {
    if (!user) return;
    setRequestingId(doctorId);
    setRequestError(null);
    try {
      await requestAssignment(user.id, doctorId);
      await refresh();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Couldn't send that request.");
    }
    setRequestingId(null);
  }

  if (loading || !user) return null;
  if (dataLoading) return <DoctorDirectorySkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Find a doctor</h1>
        <p className="text-sm text-muted-foreground">Browse verified doctors and request the one that fits you best.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="w-48 space-y-1.5">
            <Label>Specialty</Label>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All specialties</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48 space-y-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All languages</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <Checkbox
              id="onlyAvailable"
              checked={onlyAvailable}
              onCheckedChange={(checked) => setOnlyAvailable(checked === true)}
            />
            <Label htmlFor="onlyAvailable" className="font-normal">
              Only show doctors accepting new patients
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{filteredDoctors.length} doctor{filteredDoctors.length === 1 ? "" : "s"}</CardTitle>
          <CardDescription>Verified doctors only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requestError && <p className="text-sm text-destructive">{requestError}</p>}
          <DoctorList
            doctors={filteredDoctors}
            variant="directory"
            renderAction={(doctor) => {
              const related = assignments.filter((a) => a.doctorId === doctor.id);
              const isActive = related.some((a) => a.status === "active");
              const isRequested = related.some((a) => a.status === "requested");

              if (isActive) {
                return (
                  <Button size="sm" variant="secondary" disabled>
                    Your doctor
                  </Button>
                );
              }
              if (isRequested) {
                return (
                  <Button size="sm" variant="outline" disabled>
                    Requested
                  </Button>
                );
              }
              if (!doctor.acceptingNewPatients) {
                return (
                  <Button size="sm" variant="outline" disabled>
                    Not accepting patients
                  </Button>
                );
              }
              return (
                <Button
                  size="sm"
                  disabled={requestingId === doctor.id}
                  onClick={() => handleRequest(doctor.id)}
                >
                  {requestingId === doctor.id ? "Requesting..." : "Request"}
                </Button>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
