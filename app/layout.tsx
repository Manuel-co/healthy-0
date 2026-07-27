import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HealthyZero",
  description: "HealthyZero makes access to healthcare easy and affordable — connecting you with licensed doctors from the comfort of home. Zero boundaries, zero limitations, zero stigmatization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-space-mono), 'Space Mono Fallback', monospace" }}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
