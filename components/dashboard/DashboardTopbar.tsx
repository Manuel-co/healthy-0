"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, Bell, LayoutGrid, ChevronRight, PanelLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { NAV_ITEMS } from "@/components/dashboard/Sidebar";
import type { Role, Notification } from "@/lib/types";
import { getNotificationsForUser, getUnreadCount, markNotificationRead } from "@/lib/notifications-data";
import { usePolling } from "@/hooks/usePolling";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials, formatRelativeTimestamp } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const NOTIFICATIONS_POLL_MS = 5000;

function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  function refresh() {
    getNotificationsForUser(userId).then(setNotifications);
    getUnreadCount(userId).then(setUnreadCount);
  }

  useEffect(refresh, [userId]);
  usePolling(refresh, NOTIFICATIONS_POLL_MS);

  async function handleSelect(notification: Notification) {
    if (!notification.read) await markNotificationRead(notification.id);
    refresh();
    router.push(notification.href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex size-9 items-center justify-center rounded-full outline-none hover:bg-[#071938]/5" aria-label="Notifications">
          <Bell className="size-5 text-[#071938]" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-1.5 py-3 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} onSelect={() => handleSelect(n)} className="flex-col items-start gap-0.5 py-2">
              <div className="flex w-full items-center gap-1.5">
                {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-[#071938]" />}
                <p className={n.read ? "font-medium text-[#071938]/70" : "font-medium text-[#071938]"}>{n.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">{n.body}</p>
              <p className="text-[11px] text-[#071938]/40">{formatRelativeTimestamp(n.createdAt)}</p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DashboardTopbarProps {
  role: Role;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function DashboardTopbar({ role, collapsed, onToggleCollapsed }: DashboardTopbarProps) {
  const { currentUser, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Selecting a page from the mobile sidebar navigates but doesn't close the
  // sheet on its own (Link isn't a Sheet "close" trigger), so it's closed
  // explicitly on click below.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleLogOut() {
    logOut();
    router.push("/login");
  }

  if (!currentUser) return null;

  // Longest-href-first so nested routes (e.g. /dashboard/patient/doctors) don't
  // match the dashboard root (/dashboard/patient) instead of their own item.
  const activeNavItem = [...NAV_ITEMS[role]]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const breadcrumbLabel = activeNavItem?.label ?? NAV_ITEMS[role][0]?.label;

  return (
    <header className="flex items-center justify-between border-b border-border bg-[#fffef8] px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="size-4.5" />
        </Button>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>HealthyZero</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_ITEMS[role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#071938]/80 hover:bg-[#071938]/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="font-heading font-extrabold text-[#071938]">
          HealthyZero
        </Link>
        <div className="hidden items-center gap-1.5 text-sm text-[#071938]/50 md:flex">
          <span className="mx-1 h-4 w-px bg-border" />
          <LayoutGrid className="size-3.5" />
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-[#071938]">{breadcrumbLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {role !== "admin" && <NotificationBell userId={currentUser.id} />}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none">
              <Avatar size="sm">
                {currentUser.role === "doctor" && currentUser.profileImageUrl && (
                  <AvatarImage src={currentUser.profileImageUrl} alt={currentUser.name} />
                )}
                <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-medium text-[#071938]">{currentUser.name}</span>
                <span className="text-[10px] capitalize text-muted-foreground">{currentUser.role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{currentUser.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogOut}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
