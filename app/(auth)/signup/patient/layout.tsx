import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up as a Patient",
  description: "Create your HealthyZero account to get matched with a licensed doctor.",
};

export default function PatientSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
