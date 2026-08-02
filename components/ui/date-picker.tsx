"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function toISODate(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

function fromISODate(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

interface DatePickerProps {
  /** ISO "YYYY-MM-DD" — same shape as a native `<input type="date">` value, so it drops into existing string-typed form state. */
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  disabled?: (date: Date) => boolean
  defaultMonth?: Date
  className?: string
}

/** Date-only picker (Popover + Calendar) — the shadcn replacement for `<input type="date">` used across signup/profile forms. */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Pick a date",
  disabled,
  defaultMonth,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = fromISODate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-8 w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {selected ? selected.toLocaleDateString() : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) onChange(toISODate(date))
            setOpen(false)
          }}
          disabled={disabled}
          captionLayout="dropdown"
          defaultMonth={defaultMonth ?? selected}
        />
      </PopoverContent>
    </Popover>
  )
}
