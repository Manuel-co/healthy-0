import type { Role } from "@/lib/types";

export function dashboardPathFor(role: Role): string {
  switch (role) {
    case "patient":
      return "/dashboard/patient";
    case "doctor":
      return "/dashboard/doctor";
    case "admin":
      return "/admin";
  }
}

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
// TODO: point at the in-app plan management page once it exists (entitlements Phase 6).
export const PRICING_PATH = "/#pricing";
