import Link from "next/link";
import type { ReactNode } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SortableTableHead } from "@/components/dashboard/SortableTableHead";
import { Badge } from "@/components/ui/badge";
import { calculateAge, cn } from "@/lib/utils";
import type { Patient } from "@/lib/types";

interface PatientListProps {
  patients: Patient[];
  basePath: string;
  /** Makes Name/Status headers clickable sort toggles (admin list page only). */
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (column: string) => void;
  /** Admin views need the email column; doctors shouldn't see a patient's email. Defaults to true. */
  showEmail?: boolean;
  /** Doctor roster only — unread message count per patient id, shown as a badge next to the name. */
  unreadCounts?: Record<string, number>;
  /** Renders skeleton rows instead of data/empty state. */
  loading?: boolean;
  /** Overrides the default "No patients yet." message — e.g. to distinguish "no results for this search". */
  emptyState?: ReactNode;
}

const SKELETON_ROWS = 4;

export function PatientList({
  patients,
  basePath,
  sortBy,
  sortDir,
  onSortChange,
  showEmail = true,
  unreadCounts,
  loading = false,
  emptyState,
}: PatientListProps) {
  const columnCount = showEmail ? 4 : 3;

  if (!loading && patients.length === 0) {
    return <>{emptyState ?? <p className="text-sm text-muted-foreground">No patients yet.</p>}</>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead label="Name" column="name" activeColumn={sortBy} direction={sortDir} onSort={onSortChange} />
          {showEmail && <TableHead>Email</TableHead>}
          <TableHead>Date of birth</TableHead>
          <SortableTableHead label="Status" column="status" activeColumn={sortBy} direction={sortDir} onSort={onSortChange} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, col) => (
                  <TableCell key={col}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : patients.map((patient) => {
              const unread = unreadCounts?.[patient.id] ?? 0;
              return (
                <TableRow key={patient.id} className={cn("relative cursor-pointer", patient.banned && "opacity-50")}>
                  <TableCell className="relative">
                    <Link
                      href={`${basePath}/${patient.id}`}
                      className="absolute inset-0 z-0 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#071938]/40"
                    >
                      <span className="sr-only">View {patient.name}</span>
                    </Link>
                    <div className="relative z-[1] flex items-center gap-2 font-medium text-[#071938]">
                      {patient.name}
                      {unread > 0 && (
                        <Badge className="bg-[#e7f1a8] text-[#071938]" aria-label={`${unread} unread messages`}>
                          {unread}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {showEmail && <TableCell className="text-muted-foreground">{patient.email}</TableCell>}
                  <TableCell className="text-muted-foreground">
                    {patient.dob} <span className="text-[#071938]/40">({calculateAge(patient.dob)})</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={patient.verificationStatus} banned={patient.banned} />
                  </TableCell>
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
}
