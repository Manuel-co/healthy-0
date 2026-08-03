import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "From one-on-one sessions to group workshops — care built around you, led by licensed doctors.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
