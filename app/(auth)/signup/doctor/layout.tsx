import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up as a Doctor",
  description: "Join HealthyZero to see and message your patients.",
};

export default function DoctorSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
