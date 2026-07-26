"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPatientsForDoctor, getRequestedAssignmentsForDoctor, type PendingRequest } from "@/lib/doctors-data";
import { acceptAssignment, declineAssignment } from "@/lib/assignments";
import { PatientList } from "@/components/dashboard/PatientList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/lib/types";

export default function DoctorDashboardPage() {
  const { user, loading } = useRequireRole("doctor");
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  async function refresh() {
    if (!user) return;
    const [patientList, requestList] = await Promise.all([
      getPatientsForDoctor(user.id),
      getRequestedAssignmentsForDoctor(user.id),
    ]);
    setPatients(patientList);
    setRequests(requestList);
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([getPatientsForDoctor(user.id), getRequestedAssignmentsForDoctor(user.id)]).then(
      ([patientList, requestList]) => {
        setPatients(patientList);
        setRequests(requestList);
      }
    );
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

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Your assigned patients.</p>
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
                  <p className="text-xs text-muted-foreground">{request.patient.email}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>My patients ({patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientList patients={patients} basePath="/dashboard/doctor/patients" />
        </CardContent>
      </Card>
    </div>
  );
}
