"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps {
  label: string;
  column: string;
  activeColumn?: string;
  direction?: "asc" | "desc";
  onSort?: (column: string) => void;
  className?: string;
}

export function SortableTableHead({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  className,
}: SortableTableHeadProps) {
  if (!onSort) {
    return <TableHead className={className}>{label}</TableHead>;
  }

  const active = activeColumn === column;
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "-ml-1.5 flex items-center gap-1 rounded px-1.5 py-0.5 font-medium transition-colors hover:text-[#071938] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071938]/40",
          active ? "text-[#071938]" : "text-foreground"
        )}
      >
        {label}
        <Icon className={cn("size-3.5", active ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
}
