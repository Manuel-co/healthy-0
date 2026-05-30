"use client";

const services = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
        <path d="M12 8v4l3 3" strokeLinecap="round" />
      </svg>
    ),
    title: "Individual Therapy",
    desc: "One-on-one sessions tailored to your personal journey, helping you navigate life's challenges with expert guidance.",
    tag: "Most popular",
    bg: "#f5e6a3",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Couples Counselling",
    desc: "Rebuild connection and communication with your partner through structured, compassionate sessions.",
    tag: null,
    bg: "#c8d9b8",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
    title: "Online Sessions",
    desc: "Access therapy from the comfort of your home. Secure, private video consultations available 7 days a week.",
    tag: null,
    bg: "#e8e4dc",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Mental Wellness",
    desc: "Holistic programmes focused on stress, anxiety, and burnout — building resilience for everyday life.",
    tag: null,
    bg: "#f0ede6",
  },
];

export default function Services() {
  return (
    <div className="bg-[#e8e4dc] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#f0ede6] px-6 py-12 md:px-10 md:py-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a]/40 mb-3">What we offer</p>
            <h2 className="text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#1a1a1a]">
              Services built
              <br />
              around <em className="not-italic italic">you</em>
            </h2>
          </div>
          <button className="self-start sm:self-auto flex items-center gap-2.5 text-[13px] text-[#1a1a1a] bg-transparent border-none cursor-pointer group">
            View all services
            <span className="w-8 h-8 border border-black/30 rounded-full flex items-center justify-center text-sm group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform"
              style={{ background: s.bg }}
            >
              {s.tag && (
                <span className="absolute top-4 right-4 text-[10px] font-medium bg-[#1a1a1a] text-[#f0ede6] px-2.5 py-1 rounded-full tracking-wide">
                  {s.tag}
                </span>
              )}
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#1a1a1a] mb-4">
                {s.icon}
              </div>
              <div>
                <h3 className="text-[16px] leading-[1.2] text-[#1a1a1a] mb-2">{s.title}</h3>
                <p className="text-[11.5px] leading-[1.65] text-[#1a1a1a]/55">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
