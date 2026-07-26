import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { Patient } from "@/lib/types";

export function PatientList({ patients, basePath }: { patients: Patient[]; basePath: string }) {
  if (patients.length === 0) {
    return <p className="text-sm text-muted-foreground">No patients yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Date of birth</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <Link href={`${basePath}/${patient.id}`} className="font-medium text-[#071938] hover:underline">
                {patient.name}
              </Link>
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
