export const services = [
  {
    slug: "individual-therapy",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
        <path d="M12 8v4l3 3" strokeLinecap="round" />
      </svg>
    ),
    title: "Individual Therapy",
    desc: "One-on-one sessions tailored to your personal journey, helping you navigate life's challenges with expert guidance.",
    details:
      "A private, one-on-one space with a licensed clinical psychologist to work through anxiety, trauma, grief, or whatever life is bringing you right now. Sessions are paced around you — no fixed curriculum, just a plan that adapts as you make progress.",
    includes: [
      "50-minute private sessions",
      "Licensed clinical psychologists",
      "Flexible scheduling, day or evening",
      "Personalised treatment plan",
    ],
    tag: "Most popular",
    bg: "#e7f1a8",
  },
  {
    slug: "couples-counselling",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Couples Counselling",
    desc: "Rebuild connection and communication with your partner through structured, compassionate sessions.",
    details:
      "Structured sessions for two, focused on rebuilding trust and communication. Whether you're navigating a rough patch or want to strengthen an already-good relationship, your doctor gives you concrete tools to use long after the session ends.",
    includes: [
      "Joint 60-minute sessions",
      "Certified couples & family doctors",
      "Practical communication exercises",
      "Optional individual check-ins",
    ],
    tag: null,
    bg: "#cfe0f7",
  },
  {
    slug: "online-sessions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
    title: "Online Sessions",
    desc: "Access therapy from the comfort of your home. Secure, private video consultations available 7 days a week.",
    details:
      "The same quality of care, over secure video — no commute, no waiting room. Ideal if you're balancing work, travel, or simply prefer the comfort of your own space. Available every day of the week, including evenings.",
    includes: [
      "End-to-end encrypted video calls",
      "Available 7 days a week",
      "Same doctor every session",
      "Works on phone, tablet, or desktop",
    ],
    tag: null,
    bg: "#fffef8",
  },
  {
    slug: "mental-wellness",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Mental Wellness",
    desc: "Holistic programmes focused on stress, anxiety, and burnout — building resilience for everyday life.",
    details:
      "Group-based, holistic programmes for stress, anxiety, and burnout. Built around small weekly workshops and daily practices so the tools you learn actually stick, rather than staying theoretical.",
    includes: [
      "Weekly group workshops",
      "Guided mindfulness practices",
      "Progress tracking tools",
      "Community support circle",
    ],
    tag: null,
    bg: "#ffffff",
  },
];