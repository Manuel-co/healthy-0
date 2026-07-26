"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    heading: "1. Information we collect",
    body: [
      "When you create a HealthyZero account, we collect information like your name, email address, date of birth, and password. Doctors additionally provide their specialty, license number, focus areas, languages spoken, years of experience, a short bio, a profile photo, and identity verification (KYC) documents so we can confirm they're licensed to practice.",
      "When you use the platform, we also collect the information you exchange with your doctor or patients — including messages sent through HealthyZero's messaging tools, and details about the doctor-patient relationships (requests, acceptances, and care history) needed to run the service.",
    ],
  },
  {
    heading: "2. How we use your information",
    body: [
      "We use your information to create and manage your account, match patients with doctors, enable secure messaging between patients and their doctor, verify doctor credentials before they can see patients, and keep the platform safe by monitoring for misuse.",
      "We do not sell your personal information or health-related information to third parties.",
    ],
  },
  {
    heading: "3. How we share information",
    body: [
      "Your name and relevant profile details are shared between you and the doctor or patient you're connected with, so care can actually happen. Doctor profile information (specialty, focus areas, languages, experience, and bio) is visible to patients browsing our doctor directory so they can choose the right fit.",
      "We may share information with service providers who help us run the platform (such as hosting and infrastructure providers), and where required by law, regulation, or legal process.",
    ],
  },
  {
    heading: "4. Data security",
    body: [
      "We use reasonable administrative, technical, and physical safeguards designed to protect your information. No method of storage or transmission is 100% secure, so we can't guarantee absolute security — but we work to keep your data protected and to improve our safeguards over time.",
    ],
  },
  {
    heading: "5. Your rights and choices",
    body: [
      "You can review and update your account information at any time from your dashboard. You can also request that we delete your account and associated data, subject to any records we're required to keep for legal, safety, or regulatory reasons.",
    ],
  },
  {
    heading: "6. Cookies",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how HealthyZero is used so we can improve it. You can control cookies through your browser settings.",
    ],
  },
  {
    heading: "7. Children's privacy",
    body: [
      "HealthyZero is not directed at children under 18. We do not knowingly collect personal information from children under 18 without appropriate consent.",
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. If we make material changes, we'll let you know by updating the date below and, where appropriate, notifying you directly.",
    ],
  },
  {
    heading: "9. Contact us",
    body: [
      "If you have questions about this Privacy Policy or how we handle your information, reach out to us at privacy@healthyzero.dev.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#fffef8] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <Navbar />

        <main>
          <div className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 lg:px-5 lg:pt-5 lg:pb-5">
            <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#ffffff] px-6 py-12 md:px-10 md:py-16">
              <div className="max-w-[680px] mx-auto">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3">Legal</p>
                <h1 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#071938] mb-3">
                  Privacy Policy
                </h1>
                <p className="text-[12.5px] text-[#071938]/45 mb-10">Last updated: July 26, 2026</p>

                <p className="text-[13.5px] leading-[1.8] text-[#071938]/70 mb-10">
                  HealthyZero (&quot;we&quot;, &quot;us&quot;) provides a platform that connects patients with
                  licensed doctors for accessible, stigma-free healthcare. This policy explains what information we
                  collect, how we use it, and the choices you have. By using HealthyZero, you agree to the practices
                  described here.
                </p>

                <div className="space-y-9">
                  {sections.map((section) => (
                    <div key={section.heading}>
                      <h2 className="font-heading text-[17px] sm:text-[18px] font-bold text-[#071938] mb-2.5">
                        {section.heading}
                      </h2>
                      <div className="space-y-3">
                        {section.body.map((paragraph) => (
                          <p key={paragraph} className="text-[13px] leading-[1.8] text-[#071938]/65">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
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
