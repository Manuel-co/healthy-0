import { SessionStatusBadge } from "@/components/dashboard/SessionStatusBadge";
import { cn, formatSessionDate, formatSessionDuration } from "@/lib/utils";
import type { Session } from "@/lib/types";

interface SessionListItemProps {
  session: Session;
  doctorName: string;
  isActive: boolean;
  onClick: () => void;
}

/** A row in the patient inbox's session list — date/duration/status for one session with their doctor, as opposed to ConversationListItem's person+preview shape used by the doctor's multi-patient roster. */
export function SessionListItem({ session, doctorName, isActive, onClick }: SessionListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#071938]/40",
        isActive ? "bg-[#071938]/[0.06]" : "hover:bg-[#071938]/5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-medium text-[#071938]">{doctorName}</p>
        <SessionStatusBadge status={session.status} />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatSessionDate(session.endedAt, session.scheduledFor, session.startedAt)}</span>
        <span>{formatSessionDuration(session.startedAt, session.endedAt)}</span>
      </div>
    </button>
  );
}
