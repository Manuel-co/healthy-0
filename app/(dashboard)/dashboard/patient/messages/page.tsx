"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/hooks/useRequireRole";
import { getDoctorForPatient } from "@/lib/patients-data";
import { getOrCreateConversation, getLastMessage, messagePreviewText } from "@/lib/messaging";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { ConversationListItem } from "@/components/messaging/ConversationListItem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Doctor, Message, Patient } from "@/lib/types";

export default function PatientMessagesPage() {
  const { user, loading } = useRequireRole("patient");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoctorForPatient(user.id).then(async (d) => {
      if (!d) return;
      setDoctor(d);
      const conversation = await getOrCreateConversation(user.id, d.id);
      setConversationId(conversation.id);
      setLastMessage(await getLastMessage(conversation.id));
    });
  }, [user]);

  if (loading || !user) return null;
  const patient = user as Patient;

  if (patient.verificationStatus !== "verified") {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be able to message your doctor once your account is verified.
        </p>
      </div>
    );
  }

  if (!doctor || !conversationId) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">You don&apos;t have an assigned doctor yet.</p>
          <Button asChild size="sm">
            <Link href="/dashboard/patient/doctors">Find a doctor</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (chatOpen) {
    return (
      <div className="space-y-4">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={patient.id}
          otherPartyName={doctor.name}
          otherPartyAvatarUrl={doctor.profileImageUrl}
          onBack={() => setChatOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Messages</h1>
      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          <ConversationListItem
            name={doctor.name}
            avatarUrl={doctor.profileImageUrl}
            subtitle={lastMessage ? messagePreviewText(lastMessage) : doctor.specialty}
            lastMessageAt={lastMessage?.createdAt}
            onClick={() => setChatOpen(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
