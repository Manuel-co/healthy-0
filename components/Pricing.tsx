"use client";

import { useInView } from "../lib/useInView";

const plans = [
  {
    name: "Starter",
    price: "₦1,500",
    period: "/mo",
    desc: "Perfect for getting started with HealthyZero.",
    features: [
      "1 session per month",
      "Text support between sessions",
      "Access to health resources",
      "Progress tracking",
    ],
    cta: "Get started",
    highlight: false,
    bg: "#ffffff",
  },
  {
    name: "Growth",
    price: "₦5,000",
    period: "/mo",
    desc: "Our most popular plan for consistent progress.",
    features: [
      "4 sessions per month",
      "Priority doctor matching",
      "Unlimited text support",
      "Progress tracking",
      "Group workshops",
    ],
    cta: "Start free trial",
    highlight: true,
    bg: "#071938",
  },
  {
    name: "Premium",
    price: "₦10,000",
    period: "/mo",
    desc: "Comprehensive care for those who want the most.",
    features: [
      "Unlimited sessions",
      "Dedicated doctor",
      "24/7 crisis support",
      "Family sessions included",
      "Personalised care plan",
    ],
    cta: "Get started",
    highlight: false,
    bg: "#ffffff",
  },
];

export default function Pricing() {
  const { ref, inView } = useInView(0.1);

  const fadeUp = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div id="pricing" className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div
        ref={ref}
        className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#fffef8] px-6 py-12 md:px-10 md:py-16"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3" style={fadeUp(0)}>
            Pricing
          </p>
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#071938]"
            style={fadeUp(100)}
          >
            Simple, transparent
            <br />
            <em className="not-italic italic">pricing</em>
          </h2>
        </div>

        {/* Plans — middle card scales up slightly for emphasis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: p.bg,
                opacity: inView ? 1 : 0,
                transform: inView
                  ? p.highlight ? "translateY(0) scale(1.02)" : "translateY(0) scale(1)"
                  : "translateY(48px) scale(0.96)",
                transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${150 + i * 120}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${150 + i * 120}ms`,
              }}
            >
              {p.highlight && (
                <div className="absolute top-4 right-4 text-[10px] font-medium bg-[#e7f1a8] text-[#071938] px-2.5 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div>
                <p
                  className={`text-[11px] tracking-widest uppercase mb-4 ${
                    p.highlight ? "text-white/40" : "text-[#071938]/40"
                  }`}
                >
                  {p.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className={`text-[44px] leading-none font-light tracking-tight ${
                      p.highlight ? "text-white" : "text-[#071938]"
                    }`}
                  >
                    {p.price}
                  </span>
                  <span
                    className={`text-[13px] mb-1.5 ${
                      p.highlight ? "text-white/40" : "text-[#071938]/40"
                    }`}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  className={`text-[12px] leading-[1.6] mb-6 ${
                    p.highlight ? "text-white/50" : "text-[#071938]/50"
                  }`}
                >
                  {p.desc}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2.5"
                      style={{
                        opacity: inView ? 1 : 0,
                        transform: inView ? "translateX(0)" : "translateX(-12px)",
                        transition: `opacity 0.5s ease ${350 + i * 120 + j * 60}ms, transform 0.5s ease ${350 + i * 120 + j * 60}ms`,
                      }}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          p.highlight ? "bg-white/15" : "bg-black/8"
                        }`}
                      >
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke={p.highlight ? "white" : "#071938"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span
                        className={`text-[12px] ${
                          p.highlight ? "text-white/70" : "text-[#071938]/65"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3 rounded-full text-[13px] font-medium transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  p.highlight
                    ? "bg-[#0040b2] text-[#fffef8] hover:bg-[#1a56c9]"
                    : "bg-[#071938] text-[#fffef8] hover:bg-[#0a2c5c]"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
