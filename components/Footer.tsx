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
    <div className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#071938]">

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
              Ready to see a
              <br />
              <em className="not-italic italic text-[#e7f1a8]">doctor today?</em>
            </h2>
            <p
              className="text-[12.5px] text-white/40 max-w-[380px] leading-[1.7]"
              style={fadeUp(ctaInView, 120)}
            >
              Join over 12,000 people who get quality healthcare with zero boundaries, zero
              limitations, and zero stigmatization.
            </p>
          </div>

          <div
            className="flex items-center gap-3 flex-shrink-0"
            style={fadeUp(ctaInView, 220)}
          >
            <button className="bg-[#0040b2] text-[#fffef8] px-6 py-3 rounded-full text-[13px] font-medium hover:bg-[#1a56c9] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
              Get started — ₦1,500/m
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
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="" className="w-[26px] h-[26px] object-contain" />
              <p className="text-[15px] font-medium text-white tracking-tight">HealthyZero</p>
            </div>
            <p className="text-[11.5px] text-white/35 leading-[1.7] max-w-[200px] mb-5">
              Accessible healthcare for everyone, wherever you are.
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

        {/* ── Big brand mark ── */}
        <div
          className="px-6 pt-14 pb-6 md:pt-20 md:pb-8 border-t border-white/10 flex flex-col items-center justify-center"
          style={fadeUp(linksInView, 400)}
        >
          <img
            src="/footerimage.png"
            alt="HealthyZero"
            className="w-full max-w-[420px] sm:max-w-[620px] md:max-w-[820px] lg:max-w-[960px] h-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="text-[11px] text-white/25 mt-4 tracking-wide">Zero barriers to healthcare</p>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="px-6 py-5 md:px-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={fadeIn(linksInView, 500)}
        >
          <p className="text-[11px] text-white/25">© 2026 HealthyZero. All rights reserved.</p>
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
