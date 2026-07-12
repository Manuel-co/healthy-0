"use client";

import { useInView } from "../lib/useInView";

const personality = [
  {
    trait: "Compassionate",
    desc: "We approach healthcare with empathy and genuine care for every individual.",
  },
  {
    trait: "Responsive",
    desc: "We act with urgency, so people get the care and support they need when they need it.",
  },
  {
    trait: "Trustworthy",
    desc: "Reliable, transparent care that people can depend on.",
  },
  {
    trait: "Inclusive",
    desc: "Quality healthcare, accessible to everyone, regardless of circumstance.",
  },
];

const values = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
      </svg>
    ),
    title: "Private, by design",
    desc: "What you share with your doctor stays between you and your doctor.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Without judgment",
    desc: "Support for sensitive or stigmatized conditions, treated with the same care as any other visit.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Wherever you are",
    desc: "Care for remote and shift workers, and anyone without a clinic nearby.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Ongoing conditions",
    desc: "Continuous, consistent care for chronic conditions like diabetes.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
    title: "Simple to use",
    desc: "An easier way to see a doctor, especially if you'd rather not sit in a waiting room.",
  },
];

export default function Mission() {
  const { ref, inView } = useInView(0.1);

  const fadeUp = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div id="mission" className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div
        ref={ref}
        className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-white px-6 py-12 md:px-10 md:py-16"
      >
        {/* Header */}
        <div className="max-w-[560px] mb-10">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3" style={fadeUp(0)}>
            Our purpose
          </p>
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#071938]"
            style={fadeUp(100)}
          >
            Healthcare, without the <em className="not-italic italic">barriers</em>
          </h2>
        </div>

        {/* Mission / Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div
            className="rounded-2xl p-6 md:p-8 bg-[#e7f1a8]"
            style={fadeUp(200)}
          >
            <p className="text-[11px] tracking-[0.12em] uppercase text-[#071938]/50 mb-3">Mission</p>
            <p className="text-[15px] md:text-[16px] leading-[1.6] text-[#071938]">
              To remove the barriers between people and quality healthcare — by making healthcare
              simple, private, and easily accessible.
            </p>
          </div>
          <div
            className="rounded-2xl p-6 md:p-8 bg-[#cfe0f7]"
            style={fadeUp(300)}
          >
            <p className="text-[11px] tracking-[0.12em] uppercase text-[#071938]/50 mb-3">Vision</p>
            <p className="text-[15px] md:text-[16px] leading-[1.6] text-[#071938]">
              A world where healthcare is accessible to everyone, without barriers of stigma,
              distance, or circumstance.
            </p>
          </div>
        </div>

        {/* Personality — how we show up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 py-8 mb-8 border-y border-[#071938]/8">
          {personality.map((p, i) => (
            <div key={p.trait} style={fadeUp(350 + i * 80)}>
              <p className="text-[15px] font-medium text-[#0040b2] mb-1.5">{p.trait}</p>
              <p className="text-[11.5px] leading-[1.6] text-[#071938]/55">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Who we build for */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="rounded-2xl p-5 bg-[#fffef8] border border-[#071938]/8"
              style={fadeUp(700 + i * 100)}
            >
              <div className="w-9 h-9 rounded-lg bg-[#071938]/5 flex items-center justify-center text-[#071938] mb-4">
                {v.icon}
              </div>
              <h3 className="text-[13.5px] leading-[1.3] text-[#071938] mb-1.5 font-medium">
                {v.title}
              </h3>
              <p className="text-[11.5px] leading-[1.6] text-[#071938]/55">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
