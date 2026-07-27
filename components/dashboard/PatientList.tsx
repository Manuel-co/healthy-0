import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SortableTableHead } from "@/components/dashboard/SortableTableHead";
import type { Patient } from "@/lib/types";

interface PatientListProps {
  patients: Patient[];
  basePath: string;
  /** Makes Name/Status headers clickable sort toggles (admin list page only). */
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (column: string) => void;
}

export function PatientList({ patients, basePath, sortBy, sortDir, onSortChange }: PatientListProps) {
  if (patients.length === 0) {
    return <p className="text-sm text-muted-foreground">No patients yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead label="Name" column="name" activeColumn={sortBy} direction={sortDir} onSort={onSortChange} />
          <TableHead>Email</TableHead>
          <TableHead>Date of birth</TableHead>
          <SortableTableHead label="Status" column="status" activeColumn={sortBy} direction={sortDir} onSort={onSortChange} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id} className="relative cursor-pointer">
            <TableCell className="relative">
              <Link
                href={`${basePath}/${patient.id}`}
                className="absolute inset-0 z-0 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#071938]/40"
              >
                <span className="sr-only">View {patient.name}</span>
              </Link>
              <div className="relative z-[1] font-medium text-[#071938]">{patient.name}</div>
            </TableCell>
            <TableCell className="text-muted-foreground">{patient.email}</TableCell>
            <TableCell className="text-muted-foreground">{patient.dob}</TableCell>
            <TableCell>
              <StatusBadge status={patient.verificationStatus} banned={patient.banned} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
