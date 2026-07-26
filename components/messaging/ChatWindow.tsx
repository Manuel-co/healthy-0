"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getMessages, sendMessage } from "@/lib/messaging";
import { usePolling } from "@/hooks/usePolling";
import { MessageInput } from "@/components/messaging/MessageInput";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import type { Message } from "@/lib/types";

const POLL_INTERVAL_MS = 4000;

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatarUrl?: string | null;
  onBack?: () => void;
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherPartyName,
  otherPartyAvatarUrl,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const fetched = await getMessages(conversationId);
    setMessages(fetched);
  }, [conversationId]);

  useEffect(() => {
    getMessages(conversationId).then(setMessages);
  }, [conversationId]);

  // Foreshadows a real backend: once Supabase is wired in, this interval is
  // where a poll-for-new-messages call belongs (see plan's messaging notes).
  usePolling(refresh, POLL_INTERVAL_MS);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(text: string, imageUrl: string | null) {
    const optimistic = await sendMessage(conversationId, currentUserId, text, imageUrl);
    setMessages((prev) => [...prev, optimistic]);
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="-ml-2" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <Avatar size="sm">
          {otherPartyAvatarUrl && <AvatarImage src={otherPartyAvatarUrl} alt={otherPartyName} />}
          <AvatarFallback>{initials(otherPartyName)}</AvatarFallback>
        </Avatar>
        <p className="font-heading font-bold text-[#071938]">{otherPartyName}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
        )}
        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  isMine ? "bg-[#071938] text-[#fffef8]" : "bg-[#f2f1e8] text-[#071938]"
                )}
              >
                {message.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.imageUrl}
                    alt="Shared attachment"
                    className={cn("max-w-full rounded-lg", message.text && "mb-2")}
                  />
                )}
                {message.text && <p>{message.text}</p>}
                <p className={cn("mt-1 text-[10px]", isMine ? "text-[#fffef8]/60" : "text-[#071938]/50")}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
