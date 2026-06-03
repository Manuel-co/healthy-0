"use client";

import { useInView } from "../lib/useInView";

const links = {
  Company: ["About Us", "Our Team", "Careers", "Press"],
  Services: ["Individual Therapy", "Couples Counselling", "Online Sessions", "Mental Wellness"],
  Support: ["Help Centre", "Contact Us", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  const { ref: ctaRef, inView: ctaInView } = useInView(0.1);
  const { ref: linksRef, inView: linksInView } = useInView(0.1);

  const fadeUp = (inView: boolean, delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const fadeIn = (inView: boolean, delay: number) => ({
    opacity: inView ? 1 : 0,
    transition: `opacity 0.6s ease ${delay}ms`,
  });

  return (
    <div className="bg-[#e8e4dc] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#1a1a1a]">

        {/* ── CTA band ── */}
        <div
          ref={ctaRef}
          className="px-6 py-12 md:px-10 md:py-16 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <h2
              className="text-[32px] sm:text-[40px] leading-[1.05] tracking-[-0.02em] text-white mb-3"
              style={fadeUp(ctaInView, 0)}
            >
              Ready to start your
              <br />
              <em className="not-italic italic text-[#c9b99a]">healing journey?</em>
            </h2>
            <p
              className="text-[12.5px] text-white/40 max-w-[380px] leading-[1.7]"
              style={fadeUp(ctaInView, 120)}
            >
              Join over 12,000 people who have found balance, clarity, and happiness with Healthy-Zero.
            </p>
          </div>

          <div
            className="flex items-center gap-3 flex-shrink-0"
            style={fadeUp(ctaInView, 220)}
          >
            <button className="bg-[#c9b99a] text-[#1a1a1a] px-6 py-3 rounded-full text-[13px] font-medium hover:bg-[#d4c4a8] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
              Get started — $3.99/m
            </button>
            <button className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer group">
              Learn more
              <span className="w-7 h-7 border border-white/20 rounded-full flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>

        {/* ── Main footer grid ── */}
        <div
          ref={linksRef}
          className="px-6 py-10 md:px-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1" style={fadeUp(linksInView, 0)}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-[26px] h-[26px] bg-[#f0ede6] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 14 14" className="w-[14px] h-[14px] fill-[#1a1a1a]">
                  <polygon points="7,1 13,5 13,11 7,13 1,11 1,5" />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-white tracking-tight">Healthy-Zero</span>
            </div>
            <p className="text-[11.5px] text-white/35 leading-[1.7] max-w-[200px] mb-5">
              Compassionate therapy for everyone. Every act of kindness starts with you.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {[
                {
                  label: "Twitter",
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 border border-white/15 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:scale-110 transition-all duration-300"
                  style={fadeIn(linksInView, 100 + i * 80)}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — stagger per column */}
          {Object.entries(links).map(([heading, items], colIdx) => (
            <div key={heading} style={fadeUp(linksInView, 100 + colIdx * 100)}>
              <p className="text-[11px] tracking-[0.12em] uppercase text-white/30 mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {items.map((item, itemIdx) => (
                  <li
                    key={item}
                    style={fadeIn(linksInView, 200 + colIdx * 100 + itemIdx * 50)}
                  >
                    <a
                      href="#"
                      className="text-[12px] text-white/50 hover:text-white hover:translate-x-0.5 transition-all duration-300 inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="px-6 py-5 md:px-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={fadeIn(linksInView, 500)}
        >
          <p className="text-[11px] text-white/25">© 2026 Healthy-Zero. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] text-white/25 hover:text-white/60 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
