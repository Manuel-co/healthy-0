import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ComponentType<{ className?: string }>;
  href?: string;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, href, trend }: StatCardProps) {
  const card = (
    <Card
      className={cn(
        "transition-all",
        href && "hover:border-[#071938]/25 hover:shadow-md"
      )}
    >
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-extrabold text-[#071938]">{value}</p>
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#4c7a2f]">
              <TrendingUp className="size-3" />
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e7f1a8]">
            <Icon className="size-5 text-[#071938]" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071938]/40"
    >
      {card}
    </Link>
  );
}
