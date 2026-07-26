"use client";

import { useEffect, useState } from "react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getPatientsForDoctor } from "@/lib/doctors-data";
import { getOrCreateConversation, getLastMessage, messagePreviewText } from "@/lib/messaging";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { ConversationListItem } from "@/components/messaging/ConversationListItem";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor, Message, Patient } from "@/lib/types";

interface PatientConversation {
  patient: Patient;
  conversationId: string;
  lastMessage: Message | null;
}

export default function DoctorMessagesPage() {
  const { user, loading } = useRequireRole("doctor");
  const [conversations, setConversations] = useState<PatientConversation[]>([]);
  const [openPatient, setOpenPatient] = useState<PatientConversation | null>(null);

  useEffect(() => {
    if (!user) return;
    getPatientsForDoctor(user.id).then(async (patients) => {
      const withConversations = await Promise.all(
        patients.map(async (patient) => {
          const conversation = await getOrCreateConversation(patient.id, user.id);
          const lastMessage = await getLastMessage(conversation.id);
          return { patient, conversationId: conversation.id, lastMessage };
        })
      );
      withConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? "";
        const bTime = b.lastMessage?.createdAt ?? "";
        return bTime.localeCompare(aTime);
      });
      setConversations(withConversations);
    });
  }, [user]);

  if (loading || !user) return null;
  const doctor = user as Doctor;

  if (doctor.verificationStatus !== "verified") {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be able to message patients once your account is verified.
        </p>
      </div>
    );
  }

  if (openPatient) {
    return (
      <div className="space-y-4">
        <ChatWindow
          conversationId={openPatient.conversationId}
          currentUserId={doctor.id}
          otherPartyName={openPatient.patient.name}
          onBack={() => setOpenPatient(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have any patients yet.</p>
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0">
            {conversations.map((c) => (
              <ConversationListItem
                key={c.patient.id}
                name={c.patient.name}
                subtitle={c.lastMessage ? messagePreviewText(c.lastMessage) : "No messages yet"}
                lastMessageAt={c.lastMessage?.createdAt}
                onClick={() => setOpenPatient(c)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
