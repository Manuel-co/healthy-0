"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor } from "@/lib/routes";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="bg-[#fffef8] px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5">
    <nav className="relative z-20 bg-[#ffffff] rounded-[20px] lg:rounded-[28px] overflow-hidden">
      {/* Main bar */}
      <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-[#071938]">
          <div className="w-[34px] h-[34px] bg-[#071938] rounded-[8px] flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="" className="w-[24px] h-[24px] object-contain" />
          </div>
          HealthyZero
        </Link>

        {/* Center — hidden on mobile, visible md+ */}
        <div className="hidden md:flex items-center gap-6 lg:gap-7 absolute left-1/2 -translate-x-1/2">
          {/* Nav links */}
          <div className="flex items-center gap-6 lg:gap-7 text-sm">
            <Link href="/" className="text-[#071938] font-medium">Home</Link>
            <Link href="/#about" className="text-[#071938]/60 hover:text-[#071938] transition-colors">About Us</Link>
            <Link href="/#pricing" className="text-[#071938]/60 hover:text-[#071938] transition-colors">Pricing</Link>
          </div>
        </div>

        {/* Auth actions — desktop only */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {currentUser ? (
            <Link
              href={dashboardPathFor(currentUser.role)}
              className="px-4 py-2 rounded-full bg-[#071938] text-[#fffef8] font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[#071938]/70 hover:text-[#071938] font-medium">
                Log in
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-full bg-[#071938] text-[#fffef8] font-medium">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile only, nav links cover desktop */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="md:hidden w-9 h-9 border border-black/20 rounded-lg flex flex-col items-center justify-center gap-[5px] bg-transparent cursor-pointer"
        >
          <span className={`block w-4 h-[1.5px] bg-[#071938] rounded-sm transition-all ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-[#071938] rounded-sm transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block w-[11px] h-[1.5px] bg-[#071938] rounded-sm self-end mr-[10px] transition-all ${open ? "-rotate-45 -translate-y-[6.5px] w-4 mr-0" : ""}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden border-t border-black/10 px-5 py-5 flex flex-col gap-4 bg-[#ffffff]">
          <Link href="/" className="text-[15px] font-medium text-[#071938]">Home</Link>
          <Link href="/#about" className="text-[15px] text-[#071938]/60">About Us</Link>
          <Link href="/#pricing" className="text-[15px] text-[#071938]/60">Pricing</Link>
          <div className="h-px bg-black/10 my-1" />
          {currentUser ? (
            <Link href={dashboardPathFor(currentUser.role)} className="text-[15px] font-medium text-[#071938]">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[15px] font-medium text-[#071938]">Log in</Link>
              <Link href="/signup" className="text-[15px] font-medium text-[#071938]">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
    </div>
  );
}
