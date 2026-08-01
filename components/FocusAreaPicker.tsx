"use client";

import { FOCUS_AREAS } from "@/lib/focus-areas";
import { cn } from "@/lib/utils";

interface FocusAreaPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** Multi-select over the controlled focus-area vocabulary (lib/focus-areas.ts) — toggle chips, not free text, so patient intake stays directly comparable to doctor profiles. */
export function FocusAreaPicker({ value, onChange }: FocusAreaPickerProps) {
  function toggle(area: string) {
    onChange(value.includes(area) ? value.filter((a) => a !== area) : [...value, area]);
  }

  return (
    <div role="group" aria-label="Focus areas" className="flex flex-wrap gap-1.5">
      {FOCUS_AREAS.map((area) => {
        const selected = value.includes(area);
        return (
          <button
            key={area}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(area)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071938]/40",
              selected
                ? "border-[#071938] bg-[#071938] text-white"
                : "border-border text-[#071938]/70 hover:bg-[#071938]/5"
            )}
          >
            {area}
          </button>
        );
      })}
    </div>
  );
}
