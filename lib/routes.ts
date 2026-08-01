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
/** Public marketing pricing section — for logged-out visitors. */
export const PRICING_PATH = "/#pricing";
/** In-app plan management — for an already-logged-in patient upgrading/downgrading. */
export const PLAN_PATH = "/dashboard/patient/plan";
