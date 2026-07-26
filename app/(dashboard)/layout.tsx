"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fffef8]" />;
  }

  if (!currentUser) {
    // useRequireRole on each page handles the redirect; avoid rendering nav with no role.
    return <div className="min-h-screen bg-[#fffef8]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#fffef8]">
      <Sidebar role={currentUser.role} />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar role={currentUser.role} />
        <main className="flex-1 px-4 py-6 md:px-8">
          {currentUser.role !== "admin" && (
            <VerificationBanner status={currentUser.verificationStatus} rejectionReason={currentUser.rejectionReason} />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
