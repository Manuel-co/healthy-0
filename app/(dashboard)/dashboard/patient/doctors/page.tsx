"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getVerifiedDoctors } from "@/lib/doctors-data";
import { getPatientById, getDoctorForPatient } from "@/lib/patients-data";
import { getAssignmentsForPatient } from "@/lib/assignments";
import { getMatchingDoctors, requestMatchedDoctor, autoAssignBestMatch, type MatchResult } from "@/lib/matching";
import { getEntitlements } from "@/lib/plans";
import { DoctorList } from "@/components/dashboard/DoctorList";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import { IntakeForm } from "@/components/dashboard/IntakeForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Assignment, Doctor, Patient } from "@/lib/types";

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
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
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
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assignedDoctor, setAssignedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Phase 2/4 flow state — all client-only, recomputed from a fresh submit, not persisted.
  const [switching, setSwitching] = useState(false);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [justMatched, setJustMatched] = useState<MatchResult | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [matching, setMatching] = useState(false);

  // Directory filters — unchanged from the original directory.
  const [specialty, setSpecialty] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [freshPatient, doctor, verifiedDoctors, patientAssignments] = await Promise.all([
      getPatientById(user.id),
      getDoctorForPatient(user.id),
      getVerifiedDoctors(),
      getAssignmentsForPatient(user.id),
    ]);
    setPatient(freshPatient ?? null);
    setAssignedDoctor(doctor ?? null);
    setDoctors(verifiedDoctors);
    setAssignments(patientAssignments);
    return freshPatient ?? null;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getPatientById(user.id),
      getDoctorForPatient(user.id),
      getVerifiedDoctors(),
      getAssignmentsForPatient(user.id),
    ]).then(([freshPatient, doctor, verifiedDoctors, patientAssignments]) => {
      setPatient(freshPatient ?? null);
      setAssignedDoctor(doctor ?? null);
      setDoctors(verifiedDoctors);
      setAssignments(patientAssignments);
      setDataLoading(false);
    });
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

  async function handleIntakeSaved(updatedPatient: Patient) {
    setFlowError(null);
    setMatches(null);
    setJustMatched(null);
    setMatching(true);
    const entitlements = getEntitlements(updatedPatient);
    try {
      if (entitlements.canChooseDoctor) {
        const results = await getMatchingDoctors(updatedPatient.intake!);
        setMatches(results);
        setPatient(updatedPatient);
      } else {
        const result = await autoAssignBestMatch(updatedPatient);
        setJustMatched(result.match);
        await refresh();
        setSwitching(false);
      }
    } catch (err) {
      setFlowError(err instanceof Error ? err.message : "Couldn't find a match — try again.");
    }
    setMatching(false);
  }

  async function handleRequest(doctorId: string) {
    if (!patient) return;
    setRequestingId(doctorId);
    setRequestError(null);
    try {
      await requestMatchedDoctor(patient, doctorId);
      await refresh();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Couldn't send that request.");
    }
    setRequestingId(null);
  }

  if (loading || !user) return null;
  if (dataLoading || !patient) return <DoctorDirectorySkeleton />;

  const entitlements = getEntitlements(patient);
  const matchReasons = matches
    ? Object.fromEntries(matches.map((m) => [m.doctor.id, m.matchReason]))
    : undefined;
  const noExactMatch = matches !== null && matches.length > 0 && matches[0].matchReason.length === 0;
  const showGate = !assignedDoctor || switching;

  function renderDirectoryAction(doctor: Doctor) {
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
    if (!entitlements.canChooseDoctor) {
      return <span className="text-xs text-muted-foreground">Matched automatically</span>;
    }
    return (
      <Button size="sm" disabled={requestingId === doctor.id} onClick={() => handleRequest(doctor.id)}>
        {requestingId === doctor.id ? "Requesting..." : "Request"}
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Find a doctor</h1>
        <p className="text-sm text-muted-foreground">
          {entitlements.canChooseDoctor
            ? "Tell us what you're looking for, then choose the doctor that fits you best."
            : "Tell us what you're looking for so we can match you with the right doctor."}
        </p>
      </div>

      {/* ── Current doctor summary (Phase 2: gate lives behind "no assigned doctor") ── */}
      {assignedDoctor && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Your doctor</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setSwitching((s) => !s)}>
                {switching ? "Cancel" : "Find a different doctor"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <DoctorAvatar doctor={assignedDoctor} />
              <div>
                <p className="font-medium text-[#071938]">{assignedDoctor.name}</p>
                <p className="text-muted-foreground">{assignedDoctor.specialty}</p>
              </div>
            </div>
            {patient.unmatchedFlag && (
              <p className="text-xs text-amber-700">
                This match didn&apos;t have an exact focus-area overlap — our team has been notified to review it.
              </p>
            )}
            {!entitlements.canChooseDoctor && (
              <p className="text-xs text-muted-foreground">
                You&apos;re on the Basic plan, so we match you automatically.{" "}
                <Link href="/dashboard/patient/plan" className="font-medium text-[#071938] underline underline-offset-2">
                  Upgrade to choose your own doctor
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Phase 2: the intake form, gated whenever there's no assigned doctor ── */}
      {showGate && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us what you&apos;re looking for</CardTitle>
            <CardDescription>
              A few quick questions so we can match you to the right doctor. You can update this anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntakeForm patient={patient} onSaved={handleIntakeSaved} />
            {flowError && <p className="mt-3 text-sm text-destructive">{flowError}</p>}
          </CardContent>
        </Card>
      )}

      {/* ── Phase 4: Basic auto-match confirmation ── */}
      {justMatched && (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;ve been matched with {justMatched.doctor.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <DoctorAvatar doctor={justMatched.doctor} />
              <div>
                <p className="font-medium text-[#071938]">{justMatched.doctor.name}</p>
                <p className="text-muted-foreground">{justMatched.doctor.specialty}</p>
              </div>
            </div>
            {justMatched.matchReason.length > 0 ? (
              <Badge className="w-fit bg-accent text-accent-foreground">
                Matches: {justMatched.matchReason.join(", ")}
              </Badge>
            ) : (
              <p className="text-xs text-amber-700">
                We couldn&apos;t find an exact focus-area match, so we matched you with our best available doctor.
                Our team has been notified to review your case.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/patient/plan" className="font-medium text-[#071938] underline underline-offset-2">
                Upgrade to Pro or Max
              </Link>{" "}
              to choose your own doctor next time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 3: Pro/Max ranked shortlist ── */}
      {matching && (
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      )}
      {matches && !matching && (
        <Card>
          <CardHeader>
            <CardTitle>
              {matches.length} matched doctor{matches.length === 1 ? "" : "s"}
            </CardTitle>
            <CardDescription>
              {noExactMatch
                ? "No exact focus-area match — here are the closest available doctors."
                : "Ranked by how closely they match what you told us. Request the one that fits you best."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <DoctorList
              doctors={matches.map((m) => m.doctor)}
              variant="directory"
              matchReasons={matchReasons}
              renderAction={(doctor) => renderDirectoryAction(doctor)}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Full verified directory — always browsable, per spec ── */}
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
          <CardDescription>The full verified directory, beyond your shortlist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DoctorList doctors={filteredDoctors} variant="directory" renderAction={renderDirectoryAction} />
        </CardContent>
      </Card>
    </div>
  );
}
