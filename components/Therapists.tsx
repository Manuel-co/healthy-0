"use client";

import { useInView } from "../lib/useInView";

const therapists = [
  {
    name: "Dr. Sarah Okonkwo",
    role: "Clinical Psychologist",
    speciality: "Anxiety & Trauma",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
    available: true,
  },
  {
    name: "Dr. James Mercer",
    role: "Couples Therapist",
    speciality: "Relationships & Communication",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    available: true,
  },
  {
    name: "Dr. Amara Diallo",
    role: "Psychiatrist",
    speciality: "Depression & Mood Disorders",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    available: false,
  },
  {
    name: "Dr. Lena Fischer",
    role: "Mindfulness Coach",
    speciality: "Stress & Burnout",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80",
    available: true,
  },
];

export default function Therapists() {
  const { ref, inView } = useInView();

  const fadeUp = (delay: number) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div id="doctors" className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div
        ref={ref}
        className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#071938] px-6 py-12 md:px-10 md:py-16"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-white/30 mb-3" style={fadeUp(0)}>
              Our team
            </p>
            <h2
              className="text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-white"
              style={fadeUp(100)}
            >
              Meet your
              <br />
              <em className="not-italic italic text-[#e7f1a8]">doctors</em>
            </h2>
          </div>
          <button
            className="self-start sm:self-auto flex items-center gap-2.5 text-[13px] text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer group"
            style={fadeUp(200)}
          >
            All doctors
            <span className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center text-sm group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        {/* Cards — staggered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {therapists.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-colors"
              style={fadeUp(200 + i * 100)}
            >
              {/* Photo */}
              <div className="relative h-[200px] overflow-hidden">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    t.available ? "bg-[#cfe0f7] text-[#071938]" : "bg-white/20 text-white"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${t.available ? "bg-green-600" : "bg-white/50"}`} />
                  {t.available ? "Available" : "Fully booked"}
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-[14px] text-white mb-0.5">{t.name}</h3>
                <p className="text-[11px] text-white/40 mb-3">{t.role}</p>
                <span className="inline-block text-[10.5px] bg-white/10 text-white/60 px-2.5 py-1 rounded-full">
                  {t.speciality}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
