"use client";

import { useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inputClasses =
  "w-full rounded-xl border border-[#071938]/15 bg-[#fffef8] px-4 py-3 text-[13px] text-[#071938] placeholder:text-[#071938]/35 focus:outline-none focus:border-[#071938]/40 transition-colors";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-[#fffef8] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <Navbar />

        <main>
          <div className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 lg:px-5 lg:pt-5 lg:pb-5">
            <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#ffffff] px-6 py-12 md:px-10 md:py-16">
              <div className="max-w-[680px] mx-auto">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3">
                  Support
                </p>

                <h1 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#071938] mb-3">
                  Get in touch
                </h1>

                <p className="text-[12.5px] text-[#071938]/45 mb-10">
                  Questions, feedback, or need help with your account? We'd love to hear from you.
                </p>

                {submitted ? (
                  <div className="rounded-2xl bg-[#071938] p-6">
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

                    <h3 className="font-heading text-[18px] text-white mb-2">
                      Message sent
                    </h3>

                    <p className="text-[13px] leading-[1.8] text-white/65">
                      Thanks for reaching out, {name.split(" ")[0] || "there"}. Our
                      support team will get back to you at {email} within 24
                      hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 mb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-[11px] tracking-[0.1em] uppercase text-[#071938]/40 mb-2"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-[11px] tracking-[0.1em] uppercase text-[#071938]/40 mb-2"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-[11px] tracking-[0.1em] uppercase text-[#071938]/40 mb-2"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="How can we help?"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-[11px] tracking-[0.1em] uppercase text-[#071938]/40 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us a bit more..."
                        className={`${inputClasses} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-[#0040b2] text-[#fffef8] px-6 py-3 text-[13px] font-medium hover:bg-[#1a56c9] hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      Send message
                    </button>
                  </form>
                )}

                <div className="rounded-2xl border border-[#071938]/10 p-6">
                  <h3 className="font-heading text-[16px] text-[#071938] mb-2">
                    Prefer email?
                  </h3>

                  <p className="text-[13px] leading-[1.8] text-[#071938]/65 mb-5">
                    Reach our support team directly and we'll respond within
                    24 hours.
                  </p>

                  <a
                    href="mailto:support@healthyzero.dev"
                    className="inline-flex items-center rounded-full bg-[#e7f1a8] px-5 py-3 text-[13px] font-medium text-[#071938] hover:opacity-90 transition-opacity"
                  >
                    support@healthyzero.dev
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
