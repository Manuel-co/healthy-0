"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { NAV_ITEMS } from "@/components/dashboard/Sidebar";
import type { Role } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function DashboardTopbar({ role }: { role: Role }) {
  const { currentUser, logOut } = useAuth();
  const router = useRouter();

  function handleLogOut() {
    logOut();
    router.push("/login");
  }

  if (!currentUser) return null;

  return (
    <header className="flex items-center justify-between border-b border-border bg-[#fffef8] px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
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
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full outline-none">
            <Avatar size="sm">
              {currentUser.role === "doctor" && currentUser.profileImageUrl && (
                <AvatarImage src={currentUser.profileImageUrl} alt={currentUser.name} />
              )}
              <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-[#071938] sm:inline">{currentUser.name}</span>
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
    </header>
  );
}
