import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function formatRelativeTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24 && date.toDateString() === now.toDateString()) return `${diffHr}h ago`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/** endedAt if it ran, else scheduledFor if it never started, formatted as "Jul 28, 2026" — "—" if neither is set. */
export function formatSessionDate(endedAt: string | null, scheduledFor: string | null, startedAt: string | null): string {
  const when = endedAt ?? scheduledFor ?? startedAt
  if (!when) return "—"
  return new Date(when).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
}

/** How long a session actually ran, e.g. "24 min" — "—" if it never started (cancelled/no-show). */
export function formatSessionDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return "—"
  const minutes = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60_000)
  return `${Math.max(minutes, 0)} min`
}

export function calculateAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
