"use client";

import { useInView } from "../lib/useInView";

const testimonials = [
  {
    quote: "Healthy-Zero changed my life. After just three months of sessions, I finally feel like myself again. The therapists are warm, professional, and genuinely care.",
    name: "Amelia R.",
    role: "Individual therapy client",
    avatar: "https://i.pravatar.cc/60?img=5",
    rating: 5,
  },
  {
    quote: "My partner and I were on the verge of separation. The couples counselling gave us tools we still use every day. We couldn't be more grateful.",
    name: "Marcus & Priya T.",
    role: "Couples counselling",
    avatar: "https://i.pravatar.cc/60?img=15",
    rating: 5,
  },
  {
    quote: "The online sessions fit perfectly into my schedule. No commute, no waiting room — just focused, effective therapy from my living room.",
    name: "Daniel K.",
    role: "Online therapy client",
    avatar: "https://i.pravatar.cc/60?img=33",
    rating: 5,
  },
];

const stats = [
  { value: "12 000+", label: "Clients helped" },
  { value: "98%", label: "Satisfaction rate" },
  { value: "50+", label: "Certified therapists" },
  { value: "7 days", label: "A week, always available" },
];

export default function Testimonials() {
  const { ref, inView } = useInView();
  const { ref: statsRef, inView: statsInView } = useInView();

  const fadeUp = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div className="bg-[#e8e4dc] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#f0ede6] px-6 py-12 md:px-10 md:py-16">

        {/* Header */}
        <div ref={ref} className="mb-10">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a]/40 mb-3" style={fadeUp(0)}>
            What clients say
          </p>
          <h2
            className="text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#1a1a1a]"
            style={fadeUp(100)}
          >
            Real stories,
            <br />
            real <em className="not-italic italic">healing</em>
          </h2>
        </div>

        {/* Testimonial cards — staggered fade up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 flex flex-col justify-between"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${200 + i * 120}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${200 + i * 120}ms`,
              }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg
                    key={j}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="#e8c96a"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? "scale(1)" : "scale(0.5)",
                      transition: `opacity 0.4s ease ${300 + i * 120 + j * 60}ms, transform 0.4s ease ${300 + i * 120 + j * 60}ms`,
                    }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-[12.5px] leading-[1.7] text-[#1a1a1a]/65 mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-black/8">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-[12px] font-medium text-[#1a1a1a]">{t.name}</p>
                  <p className="text-[11px] text-[#1a1a1a]/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row — separate observer so they animate when they scroll in */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl px-6 py-5"
              style={{
                opacity: statsInView ? 1 : 0,
                transform: statsInView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`,
              }}
            >
              <p className="text-[28px] sm:text-[32px] font-light text-[#1a1a1a] leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-[11px] text-[#1a1a1a]/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
