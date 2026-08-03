import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the HealthyZero team and help build accessible, stigma-free healthcare for everyone.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
