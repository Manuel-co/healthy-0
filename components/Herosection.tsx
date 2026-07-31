
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor } from "@/lib/routes";

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { currentUser } = useAuth();

  // Trigger entrance animations after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      {/* ── Hero card ── */}
      <div 
        className="relative w-full overflow-hidden rounded-[20px] lg:rounded-[28px]"
        style={{ minHeight: "calc(100vh - 40px)" }}
      >
        {/* Photo fills the entire card with parallax */}
        <img
          src="https://images.unsplash.com/photo-1675270427967-b8f09d7c939b?w=1400&auto=format&fit=crop&q=85"
          // src="/hero1.png"
          alt="Doctor consulting with patient"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out"
          style={{ transform: `scale(1.05) translateY(${scrollY * 0.15}px)` }}
        />

        {/* Subtle vignette overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Left-side frosted/beige overlay panel — exactly 50% */}
        <div
          className="absolute inset-y-0 left-0 w-full sm:w-[50%] transition-all duration-1000 ease-out"
          style={{
            background: "linear-gradient(to right, rgba(232,228,218,0.98) 75%, rgba(232,228,218,0.0) 100%)",
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateX(0)" : "translateX(-30px)",
          }}
        />

        {/* ── NAVBAR (inside card) ── */}
        <header 
          className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-7 lg:px-8 transition-all duration-700 ease-out"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(-20px)",
            transitionDelay: "200ms",
          }}
        >
          {/* Logo — sits on the left (beige) half */}
          <div className="flex items-center gap-2.5 text-[14px] sm:text-[15px] font-medium tracking-tight text-[#071938] group cursor-pointer">
            <div className="w-[34px] h-[34px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <img src="/Healthy0-Logo 2.svg" alt="" className="w-[24px] h-[24px] object-contain" />
            </div>
            <span className="relative">
              HealthyZero
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-[#071938] transition-all duration-300 group-hover:w-full" />
            </span>
          </div>

          {/* Right side — socials + nav links + hamburger */}
          <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">

            {/* Social icons — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              {[
                { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { label: "Instagram", isInsta: true }
              ].map((social, i) => (
                <a 
                  key={social.label}
                  href="#" 
                  aria-label={social.label}
                  className="w-8 h-8 border border-black/20 rounded-full flex items-center justify-center text-[#071938] bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:border-black/40 hover:scale-110 hover:shadow-lg transition-all duration-300"
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? "translateY(0)" : "translateY(-10px)",
                    transitionDelay: `${400 + i * 100}ms`,
                  }}
                >
                  {social.isInsta ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.path} />
                    </svg>
                  )}
                </a>
              ))}
            </div>

            {/* Nav links in a frosted pill — hidden on mobile */}
            <nav 
              className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-black/10"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(-10px)",
                transition: "all 0.7s ease-out",
                transitionDelay: "500ms",
              }}
            >
              {["Home", "About Us", "Pricing"].map((item, i) => (
                <a 
                  key={item}
                  href="#" 
                  className={`relative text-[13px] px-3 py-1.5 rounded-full transition-all duration-300 overflow-hidden group ${
                    i === 0 
                      ? "font-medium text-[#071938] bg-white/80" 
                      : "text-[#071938]/55 hover:text-[#071938]"
                  }`}
                >
                  <span className="relative z-10">{item}</span>
                  {i !== 0 && (
                    <span className="absolute inset-0 bg-white/60 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />
                  )}
                </a>
              ))}
            </nav>

            {/* Login / Dashboard — hidden on mobile */}
            <Link
              href={currentUser ? dashboardPathFor(currentUser.role) : "/login"}
              className="hidden md:inline-flex items-center text-[13px] font-medium px-4 py-1.5 rounded-full bg-[#071938] text-[#fffef8] hover:bg-[#071938]/90 transition-all duration-300"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(-10px)",
                transition: "all 0.7s ease-out",
                transitionDelay: "550ms",
              }}
            >
              {currentUser ? "Dashboard" : "Log in"}
            </Link>

            {/* Hamburger with enhanced animation — mobile only, nav links cover desktop */}
            <button
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 border border-black/20 rounded-lg flex flex-col items-center justify-center gap-[5px] bg-white/70 backdrop-blur-sm cursor-pointer hover:bg-white/90 hover:border-black/40 hover:scale-105 transition-all duration-300"
            >
              <span className={`block h-[1.5px] bg-[#071938] rounded-sm transition-all duration-300 ${menuOpen ? "w-4 rotate-45 translate-y-[6.5px]" : "w-4"}`} />
              <span className={`block w-4 h-[1.5px] bg-[#071938] rounded-sm transition-all duration-300 ${menuOpen ? "opacity-0 scale-0" : "opacity-100"}`} />
              <span className={`block h-[1.5px] bg-[#071938] rounded-sm transition-all duration-300 ${menuOpen ? "w-4 -rotate-45 -translate-y-[6.5px] mr-0" : "w-[11px] self-end mr-[10px]"}`} />
            </button>
          </div>
        </header>

        {/* Mobile menu with slide animation */}
        <div 
          className={`md:hidden relative z-20 px-5 pb-4 flex flex-col gap-3 bg-white/80 backdrop-blur-sm border-t border-black/10 overflow-hidden transition-all duration-500 ease-out ${
            menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {["Home", "About Us", "Pricing"].map((item, i) => (
            <a 
              key={item}
              href="#" 
              className={`text-[15px] py-2 transition-all duration-300 ${
                i === 0 ? "font-medium text-[#071938]" : "text-[#071938]/60"
              }`}
              style={{
                transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
                opacity: menuOpen ? 1 : 0,
                transitionDelay: `${i * 75}ms`,
              }}
            >
              {item}
            </a>
          ))}
          <Link
            href={currentUser ? dashboardPathFor(currentUser.role) : "/login"}
            className="text-[15px] py-2 font-medium text-[#071938] transition-all duration-300"
            style={{
              transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
              opacity: menuOpen ? 1 : 0,
              transitionDelay: "225ms",
            }}
          >
            {currentUser ? "Dashboard" : "Log in"}
          </Link>
        </div>

        {/* ── LEFT CONTENT — 50% wide ── */}
        <div 
          className="relative z-10 flex flex-col justify-between px-5 pt-40 pb-8 sm:px-7 sm:pt-44 lg:px-10 lg:pt-52 w-full sm:w-[50%]"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          {/* Headline block */}
          <div>
            <h1
              className="text-[24px] sm:text-[36px] lg:text-[46px] leading-[1.15] tracking-[-0.02em] text-[#071938] mb-5"
            >
              <span 
                className="block overflow-hidden"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? "translateY(0)" : "translateY(40px)",
                  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: "400ms",
                }}
              >
                Quality healthcare,
              </span>
              <span
                className="block overflow-hidden"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? "translateY(0)" : "translateY(40px)",
                  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: "550ms",
                }}
              >
                without barriers, by a{" "}
                <span className="inline-flex items-center gap-1.5 sm:gap-2 align-middle">
                  <span className="inline-flex w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#c7d6ef] bg-[#0040b2] items-center justify-center flex-shrink-0">
                    <img 
                      src="https://i.pravatar.cc/40?img=47" 
                      alt="doctor"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <em className="relative not-italic italic inline-block pb-1.5 sm:pb-2">
                    doctor
                    <img
                      src="/lin.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute left-0 bottom-0 w-full h-auto pointer-events-none"
                    />
                  </em>
                </span>
              </span>
            </h1>

            <p 
              className="text-[12.5px] sm:text-[13px] leading-[1.7] text-[#071938]/55 max-w-[340px] mb-8 font-light"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "700ms",
              }}
            >
              At HealthyZero, we believe healthcare shouldn&apos;t depend on where you live, what
              you&apos;re facing, or who might be watching. Private, judgment-free care from a
              licensed doctor — wherever you are.
            </p>

            <div 
              className="flex items-center gap-4 sm:gap-5"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "850ms",
              }}
            >
              <button className="relative bg-[#071938] text-[#ffffff] px-5 py-2.5 rounded-full text-[12.5px] sm:text-[13px] font-normal tracking-[0.01em] cursor-pointer overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-105 active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  Only ₦1,500/m
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#0a2c5c] to-[#071938] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button className="flex items-center gap-2.5 text-[12.5px] sm:text-[13px] text-[#071938] bg-transparent border-none cursor-pointer group">
                <span className="relative">
                  All doctors
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#071938] transition-all duration-300 group-hover:w-full" />
                </span>
                <span className="w-7 h-7 border border-black/30 rounded-full flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-x-1 group-hover:border-black/60 group-hover:bg-[#071938] group-hover:text-white">
                  →
                </span>
              </button>
            </div>
          </div>

          {/* Partners footer with stagger animation */}
          <div 
            className="mt-12"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "1000ms",
            }}
          >
            <p className="text-[11px] text-[#071938]/40 mb-3 tracking-wide uppercase">Why people choose us</p>
            <div className="flex items-center gap-6 opacity-70">
              {["100% confidential", "No waiting rooms", "Doctors available 24/7"].map((point, i) => (
                <span
                  key={point}
                  className="text-[12px] font-medium text-[#071938]/70 hover:text-[#071938] transition-colors duration-300 cursor-default"
                  style={{
                    animation: isLoaded ? `hh-fade-in 0.6s ease-out ${1100 + i * 100}ms both` : "none",
                  }}
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── FLOATING illustration card (overlapping the 50% boundary) ── */}
        <div 
          className="hidden lg:block absolute top-[55%] left-[45%] z-20 -translate-y-1/2"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(-50%) translateX(0)" : "translateY(-40%) translateX(30px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: "900ms",
          }}
        >
          
        </div>

        

        {/* Avatar stack — top right of photo */}
        <div 
          className="hidden lg:flex absolute top-[20%] right-[12%] z-20 items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 border border-white/50 shadow-lg shadow-black/5"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: "1200ms",
          }}
        >
          <div className="flex -space-x-2">
            {[15, 22, 33, 45].map((id) => (
              <img 
                key={id}
                src={`https://i.pravatar.cc/40?img=${id}`} 
                alt="" 
                className="w-8 h-8 rounded-full border-2 border-white object-cover transition-transform duration-300 hover:scale-110 hover:z-10"
              />
            ))}
          </div>
          <div className="pl-1">
            <p className="text-[11px] font-medium text-[#071938]">500+ doctors</p>
            <p className="text-[10px] text-[#071938]/50">Available now</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          style={{
            opacity: isLoaded ? 0.6 : 0,
            transition: "opacity 1s ease-out",
            transitionDelay: "1500ms",
          }}
        >
         
        </div>

        <style>{`
          @keyframes hh-float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-7px); }
          }
          @keyframes hh-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
          @keyframes hh-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-float {
            animation: hh-float 4s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: hh-pulse 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
