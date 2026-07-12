"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useInView } from "../../lib/useInView";
import { services } from "../../lib/services-data";

const stats = [
  { value: "15k+", label: "Happy clients" },
  { value: "98%", label: "Success rate" },
  { value: "24/7", label: "Support" },
];

export default function ServicesPage() {
  const { ref: introRef, inView: introInView } = useInView(0.2);
  const { ref: cardsRef, inView: cardsInView } = useInView(0.08);
  const { ref: ctaRef, inView: ctaInView } = useInView(0.2);

  const fadeUp = (inView: boolean, delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div className="bg-[#fffef8] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <Navbar />

        <main>
          {/* ── Intro ── */}
          <div className="bg-[#fffef8] px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 lg:px-5 lg:pt-5 lg:pb-5">
            <div
              ref={introRef}
              className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#ffffff] px-6 py-12 md:px-10 md:py-16"
            >
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3" style={fadeUp(introInView, 0)}>
                Our services
              </p>
              <h1
                className="text-[36px] sm:text-[48px] leading-[1.05] tracking-[-0.02em] text-[#071938] max-w-[560px]"
                style={fadeUp(introInView, 100)}
              >
                Care built around <em className="not-italic italic">you</em>
              </h1>
              <p
                className="text-[13px] leading-[1.7] text-[#071938]/55 max-w-[420px] mt-5"
                style={fadeUp(introInView, 200)}
              >
                From one-on-one sessions to group workshops, every programme is led by a licensed
                doctor and shaped around where you are right now — not a fixed script.
              </p>

              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-[#071938]/10">
                {stats.map((stat, i) => (
                  <div key={stat.label} style={fadeUp(introInView, 300 + i * 100)}>
                    <span className="text-[28px] md:text-[32px] font-light text-[#071938] tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-[11px] text-[#071938]/40 ml-2">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Detailed service cards ── */}
          <div className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((s, i) => (
                <div
                  key={s.slug}
                  className="rounded-[20px] lg:rounded-[28px] p-6 md:p-8 flex flex-col relative overflow-hidden"
                  style={{
                    background: s.bg,
                    ...fadeUp(cardsInView, 150 + i * 120),
                  }}
                >
                  {s.tag && (
                    <span className="absolute top-6 right-6 md:top-8 md:right-8 text-[10px] font-medium bg-[#071938] text-[#ffffff] px-2.5 py-1 rounded-full tracking-wide">
                      {s.tag}
                    </span>
                  )}

                  <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center text-[#071938] mb-5">
                    {s.icon}
                  </div>

                  <h2 className="text-[22px] leading-[1.2] text-[#071938] mb-3">{s.title}</h2>
                  <p className="text-[12.5px] leading-[1.7] text-[#071938]/60 mb-6 max-w-[420px]">
                    {s.details}
                  </p>

                  <ul className="space-y-2.5 mb-8">
                    {s.includes.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-black/8 flex items-center justify-center flex-shrink-0">
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#071938" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-[12px] text-[#071938]/65">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/#pricing"
                    className="mt-auto self-start flex items-center gap-2.5 text-[13px] text-[#071938] bg-white/70 hover:bg-white rounded-full px-4 py-2.5 transition-colors group"
                  >
                    See plans & pricing
                    <span className="w-6 h-6 border border-black/20 rounded-full flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#071938] group-hover:text-white">
                      →
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA band ── */}
          <div className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
            <div
              ref={ctaRef}
              className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#071938] px-6 py-12 md:px-10 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div>
                <h2
                  className="text-[28px] sm:text-[36px] leading-[1.1] tracking-[-0.02em] text-white mb-3"
                  style={fadeUp(ctaInView, 0)}
                >
                  Not sure which service is right for you?
                </h2>
                <p className="text-[12.5px] text-white/40 max-w-[380px] leading-[1.7]" style={fadeUp(ctaInView, 120)}>
                  Talk to one of our doctors — they&apos;ll help you find the right fit before you commit to a plan.
                </p>
              </div>

              <Link
                href="/#doctors"
                className="flex-shrink-0 bg-[#0040b2] text-[#fffef8] px-6 py-3 rounded-full text-[13px] font-medium hover:bg-[#1a56c9] hover:scale-105 active:scale-95 transition-all duration-300"
                style={fadeUp(ctaInView, 220)}
              >
                Find your doctor
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}