"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor, LOGIN_PATH } from "@/lib/routes";
import type { Role, User } from "@/lib/types";

// SECURITY: this is a client-side-only guard for a mock-data prototype.
// It does not protect data at rest — real access control must come from
// the backend (Supabase RLS / middleware) once one exists.
export function useRequireRole(role: Role | Role[]): { user: User | null; loading: boolean } {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const allowed = Array.isArray(role) ? role : [role];

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.replace(LOGIN_PATH);
      return;
    }
    if (!allowed.includes(currentUser.role)) {
      router.replace(dashboardPathFor(currentUser.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading, router]);

  return { user: currentUser, loading };
}
