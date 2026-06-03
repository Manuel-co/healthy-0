"use client";

import { useState, useEffect, useRef } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [counted, setCounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setCounted(true), 800);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="bg-[#e8e4dc] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">
      <div 
        className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#f0ede6] px-6 py-12 md:px-10 md:py-16"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(40px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p 
              className="text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a]/40 mb-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.7s ease-out",
                transitionDelay: "200ms",
              }}
            >
              What we offer
            </p>
            <h2 className="text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#1a1a1a]">
              <span 
                className="block overflow-hidden"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(100%)",
                  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: "300ms",
                }}
              >
                Services built
              </span>
              <span 
                className="block overflow-hidden"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(100%)",
                  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: "400ms",
                }}
              >
                around <em className="not-italic italic relative group cursor-default">
                  you
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#1a1a1a] rounded-sm transition-all duration-500 group-hover:w-full" />
                </em>
              </span>
            </h2>
          </div>
          <button 
            className="self-start sm:self-auto flex items-center gap-2.5 text-[13px] text-[#1a1a1a] bg-transparent border-none cursor-pointer group"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(20px)",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "500ms",
            }}
          >
            <span className="relative">
              View all services
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#1a1a1a] transition-all duration-300 group-hover:w-full" />
            </span>
            <span className="w-8 h-8 border border-black/30 rounded-full flex items-center justify-center text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:border-black/60 group-hover:bg-[#1a1a1a] group-hover:text-white">
              →
            </span>
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
              style={{ 
                background: s.bg,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, transform 0.4s ease",
                transitionDelay: `${600 + i * 120}ms`,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Hover gradient overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)`,
                }}
              />

              {s.tag && (
                <span 
                  className="absolute top-4 right-4 text-[10px] font-medium bg-[#1a1a1a] text-[#f0ede6] px-2.5 py-1 rounded-full tracking-wide z-10 transition-all duration-300 group-hover:scale-105"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(-10px)",
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: `${900 + i * 120}ms`,
                  }}
                >
                  {s.tag}
                </span>
              )}

              {/* Icon with hover animation */}
              <div 
                className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#1a1a1a] mb-4 transition-all duration-500 group-hover:bg-white/90 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "scale(1)" : "scale(0.5)",
                  transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transitionDelay: `${700 + i * 120}ms`,
                }}
              >
                {s.icon}
              </div>

              <div className="relative z-10">
                <h3 className="text-[16px] leading-[1.2] text-[#1a1a1a] mb-2 transition-transform duration-300 group-hover:translate-x-1">
                  {s.title}
                </h3>
                <p className="text-[11.5px] leading-[1.65] text-[#1a1a1a]/55 transition-all duration-300 group-hover:text-[#1a1a1a]/75">
                  {s.desc}
                </p>
              </div>

              {/* Bottom arrow reveal */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center group-hover:bg-[#1a1a1a]/20 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Corner decoration on hover */}
              <div 
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700"
                style={{ 
                  background: s.bg === "#f5e6a3" ? "#e8c96a" : s.bg === "#c8d9b8" ? "#9ab87a" : "#d4cfc4",
                  transform: hoveredIndex === i ? "scale(1.5)" : "scale(0)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <div 
          className="mt-12 pt-8 border-t border-[#1a1a1a]/10 flex flex-wrap justify-between items-center gap-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: "1200ms",
          }}
        >
          {[
            { value: "15k+", label: "Happy clients" },
            { value: "98%", label: "Success rate" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="flex items-center gap-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(15px)",
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: `${1400 + i * 100}ms`,
              }}
            >
              <span className="text-[28px] md:text-[32px] font-light text-[#1a1a1a] tracking-tight">
                {stat.value}
              </span>
              <span className="text-[11px] text-[#1a1a1a]/40 leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
