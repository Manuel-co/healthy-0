"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPatientById } from "@/lib/patients-data";
import { getAssignmentForPair, acceptAssignment, declineAssignment } from "@/lib/assignments";
import { getOrCreateConversation } from "@/lib/messaging";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Assignment, Doctor, Patient } from "@/lib/types";

export default function DoctorPatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const { user, loading } = useRequireRole("doctor");
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!user) return;
    getPatientById(patientId).then(async (p) => {
      if (!p) return;
      setPatient(p);
      const relevantAssignment = await getAssignmentForPair(patientId, user.id);
      setAssignment(relevantAssignment);
      if (relevantAssignment?.status === "active") {
        const conversation = await getOrCreateConversation(p.id, user.id);
        setConversationId(conversation.id);
      }
    });
  }, [user, patientId]);

  async function handleAccept() {
    if (!assignment) return;
    setActing(true);
    const active = await acceptAssignment(assignment.id);
    setAssignment(active);
    if (active) {
      const conversation = await getOrCreateConversation(patientId, active.doctorId);
      setConversationId(conversation.id);
    }
    setActing(false);
  }

  async function handleDecline() {
    if (!assignment) return;
    setActing(true);
    await declineAssignment(assignment.id);
    router.push("/dashboard/doctor");
  }

  if (loading || !user) return null;
  if (!patient) return <p className="text-sm text-muted-foreground">Patient not found.</p>;
  const doctor = user as Doctor;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{patient.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Email: </span>{patient.email}</p>
          <p><span className="text-muted-foreground">Date of birth: </span>{patient.dob}</p>
        </CardContent>
      </Card>

      {assignment?.status === "requested" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incoming request</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button size="sm" disabled={acting} onClick={handleAccept}>
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={acting} onClick={handleDecline}>
              Decline
            </Button>
          </CardContent>
        </Card>
      )}

      {assignment?.status === "active" &&
        (doctor.verificationStatus !== "verified" ? (
          <p className="text-sm text-muted-foreground">
            You&apos;ll be able to message patients once your account is verified.
          </p>
        ) : (
          conversationId && (
            <ChatWindow conversationId={conversationId} currentUserId={doctor.id} otherPartyName={patient.name} />
          )
        ))}

      {assignment?.status !== "requested" && assignment?.status !== "active" && (
        <p className="text-sm text-muted-foreground">No active care relationship with this patient.</p>
      )}
    </div>
  );
}
