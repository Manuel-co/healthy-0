import { Card, CardContent } from "@/components/ui/card";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ComponentType<{ className?: string }>;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-extrabold text-[#071938]">{value}</p>
        </div>
        {Icon && (
          <div className="flex size-10 items-center justify-center rounded-full bg-[#e7f1a8]">
            <Icon className="size-5 text-[#071938]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
