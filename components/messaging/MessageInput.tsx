"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { SendHorizonal, Image as ImageIcon, FileText, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/lib/utils";
import type { MessageAttachment } from "@/lib/types";

const MAX_ATTACHMENT_BYTES = 3_000_000;

interface MessageInputProps {
  onSend: (text: string, attachment: MessageAttachment | null) => void;
  canShareImages: boolean;
  canShareDocuments: boolean;
}

export function MessageInput({ onSend, canShareImages, canShareDocuments }: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    onSend(trimmed, attachment);
    setText("");
    setAttachment(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>, type: MessageAttachment["type"]) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError(`${type === "image" ? "Image" : "Document"} must be smaller than 3MB.`);
      return;
    }
    setError(null);
    setAttachment({ type, name: file.name, url: await fileToDataUrl(file) });
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-3">
      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
      {attachment && (
        <div className="mb-2 flex items-center gap-2">
          {attachment.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.url} alt="Selected attachment" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-[#071938]">
              <FileText className="size-3.5" />
              {attachment.name}
            </span>
          )}
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setAttachment(null)}>
            <X className="size-3.5" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, "image")}
        />
        <input ref={documentInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, "document")} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canShareImages}
          title={canShareImages ? "Attach an image" : "Upgrade to share images"}
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canShareDocuments}
          title={canShareDocuments ? "Attach a document" : "Upgrade to share documents"}
          onClick={() => documentInputRef.current?.click()}
        >
          <FileText className="size-4" />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message..."
          className="min-h-10 resize-none"
          rows={1}
        />
        <Button type="submit" size="icon" disabled={!text.trim() && !attachment}>
          <SendHorizonal className="size-4" />
        </Button>
      </div>
    </form>
  );
}
