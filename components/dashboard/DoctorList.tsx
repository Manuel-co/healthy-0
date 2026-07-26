import Link from "next/link";
import type { ReactNode } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import type { Doctor } from "@/lib/types";

interface DoctorListProps {
  doctors: Doctor[];
  /** Admin variant only — links each row to its detail page. */
  basePath?: string;
  /** Admin variant only — active patient count per doctor id. */
  patientCounts?: Record<string, number>;
  /** "admin" (default) shows patient count + verification status. "directory" shows
   * profile details for patients browsing doctors, plus a caller-supplied action. */
  variant?: "admin" | "directory";
  /** Directory variant only — e.g. a Request/Requested button per row. */
  renderAction?: (doctor: Doctor) => ReactNode;
}

export function DoctorList({ doctors, basePath, patientCounts, variant = "admin", renderAction }: DoctorListProps) {
  if (doctors.length === 0) {
    return <p className="text-sm text-muted-foreground">No doctors yet.</p>;
  }

  if (variant === "directory") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Focus areas</TableHead>
            <TableHead>Languages</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell className="font-medium text-[#071938]">
                <div className="flex items-center gap-2.5">
                  <DoctorAvatar doctor={doctor} size="sm" />
                  {doctor.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{doctor.specialty}</TableCell>
              <TableCell className="text-muted-foreground">{doctor.focusAreas.join(", ") || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{doctor.languages.join(", ") || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{doctor.yearsExperience} yrs</TableCell>
              <TableCell className="text-right">{renderAction?.(doctor)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Specialty</TableHead>
          <TableHead>Patients</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctors.map((doctor) => (
          <TableRow key={doctor.id}>
            <TableCell>
              <Link
                href={`${basePath ?? ""}/${doctor.id}`}
                className="flex items-center gap-2.5 font-medium text-[#071938] hover:underline"
              >
                <DoctorAvatar doctor={doctor} size="sm" />
                {doctor.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{doctor.specialty}</TableCell>
            <TableCell className="text-muted-foreground">{patientCounts?.[doctor.id] ?? 0}</TableCell>
            <TableCell>
              <StatusBadge status={doctor.verificationStatus} banned={doctor.banned} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
