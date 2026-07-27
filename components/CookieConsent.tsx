"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "hz_cookie_consent";

// Async-shaped so the setState call happens in a microtask, not directly in
// the effect body (see lib/auth/auth-context.tsx's restoreSession for why).
async function hasStoredConsent(): Promise<boolean> {
  return window.localStorage.getItem(CONSENT_KEY) !== null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    hasStoredConsent().then((hasConsent) => {
      if (!hasConsent) setVisible(true);
    });
  }, []);

  function respond(choice: "accepted" | "declined") {
    window.localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="w-full rounded-2xl border border-black/10 bg-[#fffef8] px-6 py-8 shadow-[0_8px_30px_rgba(7,25,56,0.12)] flex flex-col sm:flex-row sm:items-center sm:justify-end gap-5">
        <p className="text-[13.5px] leading-[1.8] text-[#071938]/60 sm:mr-auto">
          <span className="font-medium text-[#071938]">We use cookies. </span>
          We use cookies to keep you signed in and understand how HealthyZero is used. See our{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-[#071938]">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => respond("declined")}
            className="px-5 py-3 rounded-full text-[#071938]/60 text-[13px] font-medium hover:text-[#071938] transition-colors bg-transparent border-none cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={() => respond("accepted")}
            className="px-5 py-3 rounded-full bg-[#071938] text-[#fffef8] text-[13px] font-medium hover:bg-[#0a2c5c] transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
