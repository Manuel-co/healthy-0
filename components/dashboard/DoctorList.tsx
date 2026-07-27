import Link from "next/link";
import type { ReactNode } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DoctorAvatar } from "@/components/dashboard/DoctorAvatar";
import { SortableTableHead } from "@/components/dashboard/SortableTableHead";
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
  /** Admin variant only — makes Name/Patients/Status headers clickable sort toggles. */
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (column: string) => void;
}

export function DoctorList({
  doctors,
  basePath,
  patientCounts,
  variant = "admin",
  renderAction,
  sortBy,
  sortDir,
  onSortChange,
}: DoctorListProps) {
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
          <SortableTableHead label="Name" column="name" activeColumn={sortBy} direction={sortDir} onSort={onSortChange} />
          <TableHead>Specialty</TableHead>
          <SortableTableHead
            label="Patients"
            column="patients"
            activeColumn={sortBy}
            direction={sortDir}
            onSort={onSortChange}
          />
          <SortableTableHead label="Status" column="status" activeColumn={sortBy} direction={sortDir} onSort={onSortChange} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {doctors.map((doctor) => (
          <TableRow key={doctor.id} className="relative cursor-pointer">
            <TableCell className="relative">
              <Link
                href={`${basePath ?? ""}/${doctor.id}`}
                className="absolute inset-0 z-0 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#071938]/40"
              >
                <span className="sr-only">View {doctor.name}</span>
              </Link>
              <div className="relative z-[1] flex items-center gap-2.5 font-medium text-[#071938]">
                <DoctorAvatar doctor={doctor} size="sm" />
                {doctor.name}
              </div>
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
