"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { SendHorizonal, Paperclip, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/lib/utils";

const MAX_IMAGE_BYTES = 3_000_000;

interface MessageInputProps {
  onSend: (text: string, imageUrl: string | null) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;
    onSend(trimmed, imageUrl);
    setText("");
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be smaller than 3MB.");
      return;
    }
    setError(null);
    setImageUrl(await fileToDataUrl(file));
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-3">
      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
      {imageUrl && (
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Selected attachment" className="h-16 w-16 rounded-lg object-cover" />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setImageUrl(null)}>
            <X className="size-3.5" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-4" />
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
        <Button type="submit" size="icon" disabled={!text.trim() && !imageUrl}>
          <SendHorizonal className="size-4" />
        </Button>
      </div>
    </form>
  );
}
