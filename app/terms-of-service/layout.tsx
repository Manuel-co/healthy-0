import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your access to and use of HealthyZero.",
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
