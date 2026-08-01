# HealthyZero

A telehealth marketing site plus a role-based patient/doctor/admin platform, built with [Next.js](https://nextjs.org) (App Router), React 19, Tailwind v4, and shadcn/ui. Forms use [Formik](https://formik.org) + [Yup](https://github.com/jquense/yup) for validation.

Auth, dashboards, and messaging currently run on **mock data persisted to `localStorage`** — there's no real backend yet. The data-access layer (`lib/*.ts`) is structured so it can be swapped for real Supabase Auth + Postgres calls later without rewriting UI components.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the marketing site.

**Demo accounts** (password `password123`):
- `doctor@healthyzero.dev` — verified doctor (Dr. Amara Okafor), already has active patients
- `patient@healthyzero.dev` — verified patient (Jordan Reyes), Basic plan, already matched to a doctor
- `admin@healthyzero.dev` — super admin
- `femi@healthyzero.dev` — pending doctor, for testing admin verification
- `sam@healthyzero.dev` — pending patient, Pro plan, for testing admin verification

## What's built

**Patients** sign up (name/email/dob — no KYC), complete a short intake (reason for care, focus areas, preferred language, urgency), and get matched to doctors based on that intake. **Doctors** sign up with a full profile (specialty, focus areas picked from a controlled vocabulary, languages, years of experience, bio, profile photo) plus KYC documents for admin review, see incoming patient requests and accept/decline them, and message their active patients. **Admins** verify or reject doctor/patient accounts, ban/unban, review patients flagged by the matching fallback, and see platform-wide stats.

- **Find a doctor** (`app/(dashboard)/dashboard/patient/doctors`) gates on a short intake form (`components/dashboard/IntakeForm.tsx`) whenever a patient has no assigned doctor. Submitting it runs `lib/matching.ts`'s `getMatchingDoctors` — ranked by focus-area overlap, then language match, then lightest doctor caseload — against the controlled focus-area vocabulary in `lib/focus-areas.ts` (the same list both patient intake and doctor profiles draw from, so overlap is a plain set comparison). **Pro/Max** patients (`canChooseDoctor: true` in `lib/plans.ts`) see the ranked shortlist and pick who to request; **Basic** patients are auto-assigned the top match by `autoAssignBestMatch`, with the picker gated out even at the lib level (`requestMatchedDoctor` rejects a Basic patient's request regardless of what the UI shows). When nobody shares a focus area, the top (least-loaded) doctor is still assigned but the patient is flagged (`Patient.unmatchedFlag`) for admin review instead of presented as a confident match.
- **Patient↔doctor relationship** is modeled as `Assignment` records (`requested` → `active`/`declined`, or `ended`), not a field on the user — see `lib/assignments.ts`. A patient has at most one active-or-requested assignment at a time; requesting (or being auto-matched with) a new doctor ends whichever one currently occupies that slot (the "switch" flow). Session history isn't affected by switching — `Session` records aren't cascaded from `Assignment`s.
- **Plans** (`lib/plans.ts`) are the single source of truth for tier entitlements — session quota/length, attachments, video, pay-to-extend, and `canChooseDoctor` — read by every gate in the app, never hard-coded elsewhere. Patients can upgrade/downgrade from "My Plan" (mock checkout, takes effect immediately).
- **Sessions** (`lib/sessions-data.ts`) are time-boxed doctor↔patient chat threads — either started ad-hoc or booked ahead — that lock once expired/ended/cancelled/no-show, though prior messages stay readable. Booking/starting a session counts against the patient's monthly plan quota.
- **Messaging** (`lib/messaging.ts`) is WhatsApp-style: a chat list (avatar, last-message preview, relative timestamp) that opens into a chat on click. Messages support text, an image, or both (plan-gated); the mock layer polls on an interval so the pattern already matches a future real-backend polling implementation.
- **Notifications** (`lib/notifications-data.ts`) are a simple per-user log (request accepted, new message, session reminder/cancellation) surfaced via the bell in the dashboard topbar.
- **Verification** gates messaging: a patient/doctor pending admin review sees a banner and can't message until verified. Banned accounts are blocked at login.
- **Forms** (login, patient signup, doctor signup) use Formik for state/submission and Yup schemas for validation, including nested KYC fields and the focus-area multi-select. Password fields use `components/ui/password-input.tsx`, a show/hide toggle wrapping the base `Input`.

## File structure

```
app/
├── page.tsx                          # Marketing homepage
├── layout.tsx                        # Root layout, wraps app in AuthProvider
├── globals.css                       # Tailwind/shadcn theme tokens (brand colors)
├── services/page.tsx                 # Services page
├── careers/page.tsx                  # Careers page
├── contact-us/page.tsx               # Contact form (client-side only, no backend)
├── privacy-policy/page.tsx           # Privacy policy
├── terms-of-service/page.tsx         # Terms of service
│
├── (auth)/                           # Centered auth shell
│   ├── layout.tsx
│   ├── login/page.tsx                # Formik + Yup
│   └── signup/
│       ├── page.tsx                  # "I'm a Patient" / "I'm a Doctor" chooser
│       ├── patient/page.tsx          # Patient signup (name, email, dob — no KYC), Formik + Yup
│       └── doctor/page.tsx           # Doctor signup: profile, photo, focus areas, KYC, Formik + Yup
│
└── (dashboard)/                      # Sidebar + topbar shell (role-aware nav)
    ├── layout.tsx                    # Renders VerificationBanner for pending/rejected users
    ├── dashboard/
    │   ├── patient/
    │   │   ├── page.tsx              # Profile, assigned doctor, next session, plan usage
    │   │   ├── doctors/page.tsx      # Intake-gated matching flow + ranked shortlist + full directory
    │   │   ├── plan/page.tsx         # Upgrade/downgrade plan tier
    │   │   └── messages/page.tsx     # Chat list → chat with assigned doctor
    │   └── doctor/
    │       ├── page.tsx              # Incoming requests (Accept/Decline) + patient roster
    │       ├── messages/page.tsx     # Chat list → chat with active patients
    │       └── patients/[patientId]/page.tsx  # Patient detail, accept/decline, chat
    └── admin/
        ├── page.tsx                  # Platform stats (patients, doctors, messages, pending)
        ├── doctors/
        │   ├── page.tsx              # All doctors table
        │   └── [doctorId]/page.tsx   # Doctor detail, KYC review, verify/reject/ban
        └── patients/
            ├── page.tsx              # All patients table, flags patients needing match review
            └── [patientId]/page.tsx  # Patient detail, unmatched-flag review, verify/reject/ban

components/
├── About.tsx, CookieConsent.tsx, Footer.tsx, Herosection.tsx,  # Marketing sections
│   Mission.tsx, Navbar.tsx, Pricing.tsx, Services.tsx,
│   Testimonials.tsx, Therapists.tsx
│
├── FocusAreaPicker.tsx                # Multi-select chips over lib/focus-areas.ts's controlled vocabulary
│
├── auth/
│   └── KycFields.tsx                  # ID type/number/document fields (doctor signup), Formik error props
│
├── dashboard/
│   ├── Sidebar.tsx, DashboardTopbar.tsx   # Dashboard shell chrome, role-aware nav, notification bell
│   ├── StatCard.tsx                       # Metric tile (admin overview)
│   ├── PatientList.tsx, DoctorList.tsx    # Tables — DoctorList has "admin"/"directory" variants +
│   │                                       # optional match-reason badges for the shortlist
│   ├── IntakeForm.tsx                     # Find-a-doctor intake (feeds lib/matching.ts)
│   ├── DoctorAvatar.tsx                   # Doctor photo with initials fallback
│   ├── StatusBadge.tsx, SessionStatusBadge.tsx  # Verification / session status badges
│   ├── VerificationBanner.tsx, VerificationActions.tsx  # Pending-review banner + admin actions
│   ├── BookSessionDialog.tsx, ChangePlanDialog.tsx      # Booking + plan upgrade/downgrade dialogs
│   ├── EditProfileDialog.tsx, OutOfSessionsNotice.tsx
│   ├── PendingVerificationsSection.tsx, SortableTableHead.tsx
│
├── messaging/
│   ├── InboxLayout.tsx, ChatWindow.tsx     # Session-aware chat shell + poll-based message view
│   ├── ConversationListItem.tsx, SessionListItem.tsx  # WhatsApp-style list rows
│   ├── MessageInput.tsx, VideoCallDialog.tsx
│
└── ui/                                # shadcn/ui primitives (button, card, input, password-input,
                                        # checkbox, dialog, table, tabs, select, sheet, avatar, etc.)

hooks/
├── useRequireRole.ts                 # Client-side route guard by role
└── usePolling.ts                     # setInterval hook used by ChatWindow

lib/
├── types.ts                          # Role, User, Patient, Doctor, Assignment, Session, Intake, etc.
├── routes.ts                         # dashboardPathFor(role) + path constants
├── utils.ts                          # cn(), initials(), fileToDataUrl(), formatRelativeTimestamp()
├── focus-areas.ts                    # Controlled focus-area vocabulary shared by patients and doctors
├── matching.ts                       # getMatchingDoctors, requestMatchedDoctor, autoAssignBestMatch
├── plans.ts                          # PLAN_CONFIG — single source of truth for tier entitlements
├── services-data.tsx                 # Marketing services content
│
├── auth/
│   ├── auth-context.tsx              # AuthProvider / useAuth (signup, login, session)
│   └── mock-db.ts                    # localStorage-backed user store + seed accounts (versioned)
│
├── assignments.ts                    # Assignment CRUD: request/accept/decline, the one-active guard
├── patients-data.ts                  # getAllPatients, getPatientById, saveIntake, setUnmatchedFlag
├── doctors-data.ts                   # getAllDoctors, getVerifiedDoctors, getPatientsForDoctor,
│                                      # getRequestedAssignmentsForDoctor
├── sessions-data.ts                  # Session lifecycle: booking, starting, ending, notes (versioned)
├── messaging.ts                      # Message CRUD, previews, read receipts, platform stats (versioned)
├── notifications-data.ts             # Per-user notification log
└── admin-actions.ts                  # verifyUser, rejectUser, banUser, unbanUser
```

## Notes

- **Mock auth is not secure**: passwords are stored in plaintext and route protection (`useRequireRole`) only runs client-side. Both must be replaced before any real deployment.
- All mock data lives in the browser's `localStorage`. Seed data is versioned (`lib/auth/mock-db.ts`, `lib/messaging.ts`, `lib/sessions-data.ts`) — if those shapes change again, bump the version constant so stale browser data gets replaced instead of silently drifting out of sync with the types.
- Uploaded images (doctor profile photos, chat attachments) are stored as base64 data URLs directly in `localStorage`, with client-side size caps (1.5MB profile photos, 3MB chat images) to avoid blowing the storage quota. A real backend would use actual file storage instead.
- Doctor signup's focus areas now come from the same controlled vocabulary (`lib/focus-areas.ts`) as patient intake, so matching stays a plain set comparison rather than fuzzy string matching against free text.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Formik](https://formik.org/docs/overview)
- [Yup](https://github.com/jquense/yup)
