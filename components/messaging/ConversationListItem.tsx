import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, initials, formatRelativeTimestamp } from "@/lib/utils";

interface ConversationListItemProps {
  name: string;
  avatarUrl?: string | null;
  subtitle: string;
  lastMessageAt?: string;
  unreadCount?: number;
  /** No messages have ever been sent in this conversation — render it as a secondary, muted row. */
  isEmpty?: boolean;
  /** Selected in a two-pane layout. */
  isActive?: boolean;
  onClick: () => void;
}

export function ConversationListItem({
  name,
  avatarUrl,
  subtitle,
  lastMessageAt,
  unreadCount = 0,
  isEmpty = false,
  isActive = false,
  onClick,
}: ConversationListItemProps) {
  const unread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#071938]/40",
        isActive ? "bg-[#071938]/[0.06]" : "hover:bg-[#071938]/5"
      )}
    >
      <Avatar size="lg" className={isEmpty ? "opacity-50" : undefined}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-[#071938]", unread ? "font-semibold" : "font-medium", isEmpty && "text-[#071938]/50")}>
            {name}
          </p>
          {lastMessageAt && (
            <span className={cn("shrink-0 text-[11px]", unread ? "font-medium text-[#071938]" : "text-muted-foreground")}>
              {formatRelativeTimestamp(lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              isEmpty ? "italic text-muted-foreground/70" : unread ? "font-medium text-[#071938]/80" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
          {unread && (
            <Badge className="shrink-0 bg-[#e7f1a8] text-[#071938]" aria-label={`${unreadCount} unread messages`}>
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
