"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CareersPage() {
  return (
    <div className="bg-[#fffef8] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <Navbar />

        <main>
          <div className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 lg:px-5 lg:pt-5 lg:pb-5">
            <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#ffffff] px-6 py-12 md:px-10 md:py-16">
              <div className="max-w-[680px] mx-auto">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3">
                  Careers
                </p>

                <h1 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#071938] mb-3">
                  Join the HealthyZero team
                </h1>

                <p className="text-[12.5px] text-[#071938]/45 mb-10">
                  Help us build accessible, stigma-free healthcare for everyone.
                </p>

                <div className="w-14 h-14 rounded-full bg-[#e7f1a8] flex items-center justify-center mb-6">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#071938"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 7L9 18l-5-5" />
                  </svg>
                </div>

                <h2 className="font-heading text-[17px] sm:text-[18px] font-bold text-[#071938] mb-2.5">
                  No open positions at the moment
                </h2>

                <div className="space-y-3 mb-9">
                  <p className="text-[13px] leading-[1.8] text-[#071938]/65">
                    Thank you for your interest in joining HealthyZero. We aren't
                    actively hiring right now, but we're always excited to hear
                    from talented people who share our mission of making quality
                    healthcare more accessible.
                  </p>

                  <p className="text-[13px] leading-[1.8] text-[#071938]/65">
                    As our team grows, future opportunities in engineering,
                    product design, healthcare operations, customer support,
                    marketing, and clinical partnerships will be posted here.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#071938] p-6">
                  <h3 className="font-heading text-[18px] text-white mb-2">
                    Stay in touch
                  </h3>

                  <p className="text-[13px] leading-[1.8] text-white/65 mb-5">
                    If you'd like to be considered for future opportunities,
                    send your résumé and a short introduction to:
                  </p>

                  <a
                    href="mailto:careers@healthyzero.dev"
                    className="inline-flex items-center rounded-full bg-[#e7f1a8] px-5 py-3 text-[13px] font-medium text-[#071938] hover:opacity-90 transition-opacity"
                  >
                    careers@healthyzero.dev
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}