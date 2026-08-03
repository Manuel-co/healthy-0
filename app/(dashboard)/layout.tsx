"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";

const SIDEBAR_COLLAPSED_KEY = "hz_sidebar_collapsed";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fffef8]" />;
  }

  if (!currentUser) {
    // useRequireRole on each page handles the redirect; avoid rendering nav with no role.
    return <div className="min-h-screen bg-[#fffef8]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#fffef8]">
      <Sidebar role={currentUser.role} collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar role={currentUser.role} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
          {currentUser.role !== "admin" && (
            <VerificationBanner status={currentUser.verificationStatus} rejectionReason={currentUser.rejectionReason} />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
