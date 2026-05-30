"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative z-20 bg-[#f0ede6]">
      {/* Main bar */}
      <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5 lg:px-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-[#1a1a1a]">
          <div className="w-[26px] h-[26px] bg-[#1a1a1a] rounded-[6px] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 14 14" className="w-[14px] h-[14px] fill-[#f0ede6]">
              <polygon points="7,1 13,5 13,11 7,13 1,11 1,5" />
            </svg>
          </div>
          Healthy-Zero
        </div>

        {/* Center — hidden on mobile, visible md+ */}
        <div className="hidden md:flex items-center gap-6 lg:gap-7 absolute left-1/2 -translate-x-1/2">
          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Twitter"
              className="w-8 h-8 border border-black/20 rounded-full flex items-center justify-center text-[#1a1a1a] hover:bg-black/5 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-8 h-8 border border-black/20 rounded-full flex items-center justify-center text-[#1a1a1a] hover:bg-black/5 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-6 lg:gap-7 text-sm">
            <a href="#" className="text-[#1a1a1a] font-medium">Home</a>
            <a href="#" className="text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors">About Us</a>
            <a href="#" className="text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors">Pricing</a>
          </div>
        </div>

        {/* Hamburger — always visible */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="w-9 h-9 border border-black/20 rounded-lg flex flex-col items-center justify-center gap-[5px] bg-transparent cursor-pointer"
        >
          <span className={`block w-4 h-[1.5px] bg-[#1a1a1a] rounded-sm transition-all ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-4 h-[1.5px] bg-[#1a1a1a] rounded-sm transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block w-[11px] h-[1.5px] bg-[#1a1a1a] rounded-sm self-end mr-[10px] transition-all ${open ? "-rotate-45 -translate-y-[6.5px] w-4 mr-0" : ""}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden border-t border-black/10 px-5 py-5 flex flex-col gap-4 bg-[#f0ede6]">
          <a href="#" className="text-[15px] font-medium text-[#1a1a1a]">Home</a>
          <a href="#" className="text-[15px] text-[#1a1a1a]/60">About Us</a>
          <a href="#" className="text-[15px] text-[#1a1a1a]/60">Pricing</a>
          <div className="flex items-center gap-3 pt-2 border-t border-black/10">
            <a href="#" aria-label="Twitter" className="w-8 h-8 border border-black/20 rounded-full flex items-center justify-center text-[#1a1a1a]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 border border-black/20 rounded-full flex items-center justify-center text-[#1a1a1a]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
