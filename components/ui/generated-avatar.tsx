import { Avatar as AvatuneAvatar } from "@avatune/react";
import nevmstasTheme from "@avatune/nevmstas-theme/react";

const SIZE_PX: Record<"sm" | "default" | "lg", number> = { sm: 24, default: 32, lg: 40 };

/** Deterministic illustrated avatar (same seed always renders the same character) — used as the
 *  AvatarFallback content wherever a user has no uploaded photo, instead of plain initials. */
export function GeneratedAvatarFallback({ seed, size = "default" }: { seed: string; size?: "sm" | "default" | "lg" }) {
  return <AvatuneAvatar theme={nevmstasTheme} seed={seed} size={SIZE_PX[size]} className="rounded-full" />;
}
