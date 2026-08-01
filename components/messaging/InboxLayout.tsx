import type { ReactNode } from "react";

interface InboxLayoutProps {
  /** The left-pane list content (search box + rows) — rendered as-is on desktop, and in place of the detail pane on mobile when nothing's selected. */
  list: ReactNode;
  /**
   * Renders the right-pane detail content. Receives an onBack handler on
   * mobile (full-screen detail needs a way back to the list) and undefined
   * on desktop (the list stays visible alongside, so no back button).
   */
  renderDetail: (onBack: (() => void) | undefined) => ReactNode;
  /** Whether something is currently selected — switches from emptyState to renderDetail. */
  hasSelection: boolean;
  onDeselect: () => void;
  /** Shown in the desktop right pane when nothing's selected. */
  emptyState: ReactNode;
}

/** Shared two-pane inbox shell — list on the left, detail on the right, collapsing to a single full-screen pane on mobile. Used by both the doctor and patient messages pages so they share one layout. */
export function InboxLayout({ list, renderDetail, hasSelection, onDeselect, emptyState }: InboxLayoutProps) {
  return (
    <>
      {/* Mobile: list, or full-screen detail once something is selected */}
      <div className="h-[75vh] md:hidden">
        {hasSelection ? renderDetail(onDeselect) : <div className="h-full rounded-xl border border-border bg-white">{list}</div>}
      </div>

      {/* Desktop: two-pane inbox */}
      <div className="hidden h-[75vh] gap-4 md:flex">
        <div className="w-80 shrink-0 rounded-xl border border-border bg-white">{list}</div>
        <div className="flex-1">{hasSelection ? renderDetail(undefined) : emptyState}</div>
      </div>
    </>
  );
}
