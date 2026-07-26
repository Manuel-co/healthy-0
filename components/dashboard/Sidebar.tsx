"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Users, Stethoscope, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  patient: [
    { href: "/dashboard/patient", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/patient/doctors", label: "Find a Doctor", icon: Search },
    { href: "/dashboard/patient/messages", label: "Messages", icon: MessageSquare },
  ],
  doctor: [
    { href: "/dashboard/doctor", label: "My Patients", icon: Users },
    { href: "/dashboard/doctor/messages", label: "Messages", icon: MessageSquare },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/admin/patients", label: "Patients", icon: Users },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-[#fffef8] px-3 py-6">
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#071938] text-[#fffef8]"
                  : "text-[#071938]/70 hover:bg-[#071938]/5 hover:text-[#071938]"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { NAV_ITEMS };
