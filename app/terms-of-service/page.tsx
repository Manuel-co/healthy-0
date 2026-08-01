"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    heading: "1. Acceptance of these terms",
    body: [
      "By creating an account, accessing, or using HealthyZero, you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, you should not use the platform.",
      "You must be at least 18 years old to create and use a HealthyZero account unless your use is authorised by a parent, legal guardian, or another legally permitted representative.",
    ],
  },
  {
    heading: "2. About HealthyZero",
    body: [
      "HealthyZero is a digital healthcare platform that helps patients connect with verified healthcare professionals for online consultations, messaging, care coordination, and related healthcare services.",
      "HealthyZero provides the technology used to connect patients and healthcare professionals. Except where expressly stated, HealthyZero does not replace the independent professional judgement of a licensed doctor and does not directly provide medical diagnoses or treatment.",
    ],
  },
  {
    heading: "3. Medical emergencies",
    body: [
      "HealthyZero is not an emergency service. Do not use the platform for a medical emergency, life-threatening condition, or situation requiring immediate physical care.",
      "If you believe you or another person is in immediate danger, contact your local emergency services or go to the nearest hospital or emergency care facility.",
    ],
  },
  {
    heading: "4. Account registration",
    body: [
      "You must provide accurate, complete, and current information when creating your account. You are responsible for keeping your account details updated and maintaining the confidentiality of your password and login credentials.",
      "You are responsible for activity performed through your account. You must notify HealthyZero promptly if you believe your account has been accessed without permission.",
      "You may not create an account using another person's identity, provide misleading information, or allow another person to use your account without authorisation.",
    ],
  },
  {
    heading: "5. Patient responsibilities",
    body: [
      "Patients must provide accurate and relevant information about their health, symptoms, concerns, medications, and medical history when requested. Incomplete or incorrect information may affect the quality or safety of the care provided.",
      "Patients are responsible for following the advice, treatment plans, prescriptions, referrals, and follow-up instructions provided by their healthcare professional.",
      "Patients must communicate respectfully and must not harass, threaten, impersonate, or abuse doctors, staff members, or other users.",
    ],
  },
  {
    heading: "6. Doctor responsibilities",
    body: [
      "Doctors and other healthcare professionals must provide truthful information about their identity, qualifications, licences, specialties, professional experience, and authority to practise.",
      "Healthcare professionals are responsible for maintaining all licences, registrations, certifications, and professional requirements applicable to their services.",
      "Doctors must provide care according to applicable professional standards, laws, ethical obligations, and the limits of remote healthcare.",
      "HealthyZero may review, approve, reject, suspend, or request additional documentation from healthcare professionals as part of its verification process.",
    ],
  },
  {
    heading: "7. Sessions and messaging",
    body: [
      "HealthyZero may provide messaging, session booking, video consultation, document sharing, image sharing, and other communication tools depending on your account type or subscription plan.",
      "Session availability, duration, communication features, attachment permissions, and other platform capabilities may vary depending on your subscription plan.",
      "Messages and session records may be retained to support continuity of care, platform safety, dispute resolution, and legal or regulatory obligations.",
      "You must not use HealthyZero's messaging or session tools to send unlawful, abusive, deceptive, harmful, or inappropriate content.",
    ],
  },
  {
    heading: "8. Subscriptions and payments",
    body: [
      "Some HealthyZero features require a paid subscription. Available plans, included features, session limits, session lengths, and prices will be displayed before you subscribe.",
      "By purchasing a subscription, you authorise HealthyZero and its payment providers to charge the applicable fees using your selected payment method.",
      "Subscription benefits may be subject to monthly usage limits. Unused sessions or benefits do not roll over into another billing cycle unless HealthyZero expressly states otherwise.",
      "Plan upgrades may take effect immediately. Downgrades may take effect immediately or at the start of the next billing cycle, depending on the option displayed when the change is requested.",
      "HealthyZero may change subscription prices or plan features. Where required, we will provide notice before changes apply to an existing paid subscription.",
    ],
  },
  {
    heading: "9. Cancellations and refunds",
    body: [
      "You may cancel your subscription through your account settings where that option is available. Cancellation prevents future renewal charges but does not automatically refund charges already paid.",
      "Payments are generally non-refundable except where required by law, where HealthyZero expressly approves a refund, or where a service could not be delivered because of a verified platform failure.",
      "Missed, cancelled, or incomplete appointments may be subject to the cancellation terms shown during booking.",
    ],
  },
  {
    heading: "10. Acceptable use",
    body: [
      "You may use HealthyZero only for lawful healthcare-related purposes and in accordance with these terms.",
      "You must not attempt to gain unauthorised access to another account, interfere with the platform, introduce malicious software, scrape platform data, reverse engineer protected parts of the service, bypass subscription restrictions, or misuse any security feature.",
      "You must not upload content that violates another person's privacy, intellectual property rights, confidentiality, or legal rights.",
    ],
  },
  {
    heading: "11. Privacy and health information",
    body: [
      "Your use of HealthyZero is also governed by our Privacy Policy, which explains how we collect, use, store, and share personal information.",
      "You should only submit information that is relevant to receiving or providing healthcare through the platform. Healthcare professionals must handle patient information according to applicable confidentiality and data protection obligations.",
    ],
  },
  {
    heading: "12. Intellectual property",
    body: [
      "HealthyZero and its licensors own the platform, branding, software, designs, text, graphics, and other content provided through the service, except for content submitted by users.",
      "HealthyZero grants you a limited, personal, non-exclusive, non-transferable, and revocable right to use the platform for its intended purpose.",
      "You retain ownership of content you submit. You grant HealthyZero permission to store, process, display, and transmit that content only as reasonably necessary to operate, secure, and improve the service.",
    ],
  },
  {
    heading: "13. Third-party services",
    body: [
      "HealthyZero may rely on third-party services for hosting, identity verification, communications, analytics, payments, and other platform functions.",
      "HealthyZero is not responsible for third-party services outside our control. Your use of those services may also be governed by their own terms and privacy policies.",
    ],
  },
  {
    heading: "14. Suspension and termination",
    body: [
      "HealthyZero may restrict, suspend, or terminate an account that violates these terms, threatens users or platform security, provides false information, misuses healthcare services, or creates legal or regulatory risk.",
      "Where appropriate, we may provide notice and an opportunity to correct the issue. Serious misconduct, fraud, security threats, or risks to patient safety may result in immediate suspension or termination.",
      "You may request account deletion, subject to any legal, medical, safety, financial, or regulatory records that HealthyZero or a healthcare professional must retain.",
    ],
  },
  {
    heading: "15. Service availability",
    body: [
      "We aim to keep HealthyZero available and reliable, but we cannot guarantee that the platform will always be uninterrupted, secure, or error-free.",
      "We may temporarily limit access to perform maintenance, introduce updates, address security concerns, or comply with legal requirements.",
    ],
  },
  {
    heading: "16. Disclaimers",
    body: [
      "HealthyZero is provided on an \"as available\" basis to the extent permitted by law. We do not guarantee that every healthcare professional will be suitable for every patient or that remote care will be appropriate for every medical condition.",
      "Healthcare outcomes vary between individuals. HealthyZero does not guarantee a diagnosis, treatment result, recovery, or specific medical outcome.",
      "Information provided outside a direct professional consultation is general information and should not be treated as a substitute for personalised medical advice.",
    ],
  },
  {
    heading: "17. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, HealthyZero will not be liable for indirect, incidental, special, consequential, or punitive losses arising from your use of or inability to use the platform.",
      "Nothing in these terms excludes or limits liability that cannot legally be excluded, including liability arising from fraud, deliberate misconduct, or other responsibilities protected by applicable law.",
    ],
  },
  {
    heading: "18. Changes to these terms",
    body: [
      "We may update these Terms of Service as HealthyZero develops or where changes are needed for legal, regulatory, security, or operational reasons.",
      "When material changes are made, we will update the date below and may provide additional notice through the platform or your registered contact details.",
      "Continuing to use HealthyZero after updated terms take effect means you accept the revised terms.",
    ],
  },
  {
    heading: "19. Governing law",
    body: [
      "These terms are governed by the applicable laws of the Federal Republic of Nigeria, without limiting any mandatory consumer rights available under applicable law.",
      "Before beginning formal legal proceedings, you agree to contact HealthyZero and attempt to resolve the dispute through good-faith discussions where reasonably possible.",
    ],
  },
  {
    heading: "20. Contact us",
    body: [
      "If you have questions about these Terms of Service, contact us at support@healthyzero.dev.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#fffef8] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <Navbar />

        <main>
          <div className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 lg:px-5 lg:pt-5 lg:pb-5">
            <div className="w-full rounded-[20px] lg:rounded-[28px] overflow-hidden bg-[#ffffff] px-6 py-12 md:px-10 md:py-16">
              <div className="max-w-[680px] mx-auto">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#071938]/40 mb-3">
                  Legal
                </p>

                <h1 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#071938] mb-3">
                  Terms of Service
                </h1>

                <p className="text-[12.5px] text-[#071938]/45 mb-10">
                  Last updated: August 1, 2026
                </p>

                <p className="text-[13.5px] leading-[1.8] text-[#071938]/70 mb-10">
                  These Terms of Service govern your access to and use of
                  HealthyZero. HealthyZero provides a platform that connects
                  patients with verified healthcare professionals for accessible,
                  stigma-free healthcare. By creating an account or using the
                  platform, you agree to these terms.
                </p>

                <div className="space-y-9">
                  {sections.map((section) => (
                    <div key={section.heading}>
                      <h2 className="font-heading text-[17px] sm:text-[18px] font-bold text-[#071938] mb-2.5">
                        {section.heading}
                      </h2>

                      <div className="space-y-3">
                        {section.body.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-[13px] leading-[1.8] text-[#071938]/65"
                          >
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