import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions, feedback, or need help with your account? Get in touch with HealthyZero support.",
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
