"use client";

import { useState, useEffect, useRef } from "react";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Stagger animation helper
  const getDelay = (index: number) => `${200 + index * 150}ms`;

  return (
    /* Same outer background + padding as the hero */
    <div id="about" ref={sectionRef} className="bg-[#fffef8] px-3 pb-3 sm:px-4 sm:pb-4 lg:px-5 lg:pb-5">

      {/* Card — matches hero card radius */}
      <div 
        className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#ffffff] transition-all duration-1000 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(40px)",
        }}
      >

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-0">

          {/* ── LEFT — full photo ── */}
          <div
            className="relative w-full overflow-hidden group"
            style={{ minHeight: "340px", height: "clamp(340px, 55vw, 620px)" }}
          >
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80"
              alt="Woman meditating"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-out ${
                imageLoaded ? "scale-100 blur-0" : "scale-110 blur-sm"
              }`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

            {/* Bottom CTA buttons */}
            <div 
              className="absolute bottom-5 left-5 flex items-center gap-2 md:gap-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "600ms",
              }}
            >
              {[
                { text: "Start program", delay: "700ms" },
                { text: "Contact us", delay: "800ms" }
              ].map((btn) => (
                <button 
                  key={btn.text}
                  className="group/btn flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#071938] text-[12px] md:text-[13px] font-medium px-3 py-2 md:px-4 md:py-2.5 rounded-full shadow-sm hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: btn.delay,
                  }}
                >
                  {btn.text}
                  <span className="w-4 h-4 md:w-5 md:h-5 bg-[#071938] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/btn:bg-[#0a2c5c] group-hover/btn:translate-x-0.5">
                    <svg width="7" height="7" viewBox="0 0 10 10" fill="white"><polygon points="3,2 8,5 3,8" /></svg>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT — content ── */}
          <div className="flex flex-col gap-4 p-4 md:p-5 lg:p-6 bg-[#ffffff]">

            {/* Top card — About title */}
            <div 
              className="bg-white rounded-2xl px-6 py-6 md:px-8 md:py-8 relative flex-1 overflow-hidden group/card"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "300ms",
              }}
            >
              {/* Subtle gradient orb on hover */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#e7f1a8]/30 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />

              {/* Play button with pulse ring */}
              <button className="absolute top-4 right-4 md:top-5 md:right-5 w-8 h-8 md:w-9 md:h-9 bg-[#071938] rounded-full flex items-center justify-center hover:bg-[#0a2c5c] hover:scale-110 active:scale-95 transition-all duration-300 group/play">
                <span className="absolute inset-0 rounded-full bg-[#071938]/20 animate-ping opacity-0 group-hover/play:opacity-100" />
                <svg width="9" height="11" viewBox="0 0 10 12" fill="white" className="relative z-10 ml-0.5">
                  <polygon points="1,1 9,6 1,11" />
                </svg>
              </button>

              <h2
                className="text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.0] tracking-[-0.03em] text-[#071938] mb-3"
              >
                <span 
                  className="block overflow-hidden"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(100%)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: "400ms",
                  }}
                >
                  About
                </span>
                <span 
                  className="block overflow-hidden"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(100%)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: "500ms",
                  }}
                >
                  HealthyZero
                </span>
              </h2>

              {/* Animated squiggle */}
              <svg 
                width="120" 
                height="12" 
                viewBox="0 0 120 12" 
                fill="none" 
                className="mb-5 md:mb-6"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 0.6s ease-out",
                  transitionDelay: "700ms",
                }}
              >
                <path 
                  d="M2 8 Q20 2 38 8 Q56 14 74 8 Q92 2 110 8" 
                  stroke="#0040b2" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none"
                  strokeDasharray="200"
                  strokeDashoffset={isVisible ? "0" : "200"}
                  style={{
                    transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: "800ms",
                  }}
                />
              </svg>

              <p
                className="text-[12px] md:text-[12.5px] leading-[1.65] text-[#071938]/50 max-w-full md:max-w-[340px] mb-4"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(15px)",
                  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: "600ms",
                }}
              >
                In a simple sentence: HealthyZero makes access to healthcare easy and affordable —
                connecting you with licensed doctors from the comfort of home.
              </p>

              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(15px)",
                  transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: "700ms",
                }}
              >
                {["Zero boundaries", "Zero limitations", "Zero stigmatization"].map((item, i) => (
                  <span key={item} className="flex items-center gap-3">
                    <span className="text-[11px] md:text-[11.5px] font-medium text-[#0040b2]">{item}</span>
                    {i < 2 && <span className="w-1 h-1 rounded-full bg-[#071938]/20" />}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom row — two cards */}
            <div className="grid grid-cols-2 gap-4">

              {/* Yellow card */}
              <div 
                className="rounded-2xl p-4 md:p-5 relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
                style={{ 
                  background: "#e7f1a8",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(30px)",
                  transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, transform 0.3s ease",
                  transitionDelay: "500ms",
                }}
                onMouseEnter={() => setHoveredCard(0)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Floating decorative circles */}
                <div 
                  className="absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#c7d6ef]/50 transition-all duration-700"
                  style={{
                    transform: hoveredCard === 0 ? "translate(5px, -5px) scale(1.1)" : "translate(0, 0) scale(1)",
                  }}
                />
                <div 
                  className="absolute top-7 right-7 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#9fb8e0]/40 transition-all duration-700 delay-75"
                  style={{
                    transform: hoveredCard === 0 ? "translate(8px, -3px) scale(1.15)" : "translate(0, 0) scale(1)",
                  }}
                />

                <h3
                  className="text-[15px] md:text-[17px] leading-[1.25] font-semibold text-[#071938] mb-2 relative z-10"
                >
                  Stay healthy
                  <br />
                  with HealthyZero
                </h3>
                <p className="text-[11px] md:text-[11.5px] leading-[1.6] text-[#071938]/55 relative z-10">
                  Private consultations with licensed doctors — no stigma, no waiting rooms
                </p>

                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#071938" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Green stats card */}
              <div 
                className="rounded-2xl p-4 md:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
                style={{ 
                  background: "#cfe0f7",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(30px)",
                  transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, transform 0.3s ease",
                  transitionDelay: "650ms",
                }}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <svg width="100%" height="100%">
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#071938" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                  </svg>
                </div>

                <p className="text-[11px] md:text-[11.5px] text-[#071938]/55 leading-[1.5] relative z-10">
                  Always here for you
                </p>
                <div className="flex justify-center my-2 relative z-10">
                  <div 
                    className="relative transition-transform duration-500"
                    style={{
                      transform: hoveredCard === 1 ? "translateY(-5px)" : "translateY(0)",
                    }}
                  >
                    <div className="w-8 h-12 md:w-10 md:h-14 bg-white/80 rounded-lg mx-auto shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:bg-white/95" />
                    <div className="w-6 h-2.5 md:w-7 md:h-3 bg-white/60 rounded-t-md absolute -top-2 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:bg-white/80" />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] md:text-[11px] text-[#071938]/45 mb-0.5">Patients cared for</p>
                  <p
                    className="text-[28px] md:text-[34px] font-light leading-none text-[#071938] tracking-tight tabular-nums"
                  >
                    <span 
                      className="inline-block"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? "translateY(0)" : "translateY(20px)",
                        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                        transitionDelay: "900ms",
                      }}
                    >
                      12 000
                    </span>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}