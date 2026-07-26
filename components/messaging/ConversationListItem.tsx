import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials, formatRelativeTimestamp } from "@/lib/utils";

interface ConversationListItemProps {
  name: string;
  avatarUrl?: string | null;
  subtitle: string;
  lastMessageAt?: string;
  onClick: () => void;
}

export function ConversationListItem({ name, avatarUrl, subtitle, lastMessageAt, onClick }: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
        "hover:bg-[#071938]/5"
      )}
    >
      <Avatar size="lg">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-[#071938]">{name}</p>
          {lastMessageAt && (
            <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTimestamp(lastMessageAt)}</span>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}
