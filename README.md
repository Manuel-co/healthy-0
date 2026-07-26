# HealthyZero

A telehealth marketing site plus a role-based patient/doctor/admin platform, built with [Next.js](https://nextjs.org) (App Router), React 19, Tailwind v4, and shadcn/ui.

Auth, dashboards, and messaging currently run on **mock data persisted to `localStorage`** — there's no real backend yet. The data-access layer (`lib/messaging.ts`, `lib/patients-data.ts`, `lib/doctors-data.ts`, `lib/assignments.ts`, `lib/admin-actions.ts`) is structured so it can be swapped for real Supabase Auth + Postgres calls later without rewriting UI components.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the marketing site.

**Demo accounts** (password `password123`):
- `doctor@healthyzero.dev` — verified doctor (Dr. Amara Okafor), already has active patients
- `patient@healthyzero.dev` — verified patient (Jordan Reyes), already assigned to a doctor
- `admin@healthyzero.dev` — super admin
- `femi@healthyzero.dev` — pending doctor, for testing admin verification
- `sam@healthyzero.dev` — pending patient, for testing admin verification

## What's built

**Patients** sign up (name/email/dob — no KYC), browse a directory of *verified* doctors (filter by specialty, language, "accepting new patients"), and request one. **Doctors** sign up with a full profile (specialty, focus areas, languages, years of experience, bio, profile photo) plus KYC documents for admin review, see incoming patient requests and accept/decline them, and message their active patients. **Admins** verify or reject doctor/patient accounts, ban/unban, and see platform-wide stats.

- **Patient↔doctor relationship** is modeled as `Assignment` records (`requested` → `active`/`declined`, or `ended`), not a field on the user — see `lib/assignments.ts`. A patient has at most one active-or-requested assignment at a time; requesting a new doctor ends whichever one currently occupies that slot (the "switch" flow). If a patient never requests anyone, a fallback auto-assigns them to the verified doctor with the fewest active patients.
- **Messaging** is WhatsApp-style: a chat list (avatar, last-message preview, relative timestamp) that opens into a chat on click, with a back button to return to the list. Messages support text, an image, or both; the mock layer polls on an interval so the pattern already matches a future real-backend polling implementation.
- **Verification** gates messaging: a patient/doctor pending admin review sees a banner and can't message until verified. Banned accounts are blocked at login.

## File structure

```
app/
├── page.tsx                          # Marketing homepage
├── layout.tsx                        # Root layout, wraps app in AuthProvider
├── globals.css                       # Tailwind/shadcn theme tokens (brand colors)
├── services/page.tsx                 # Services page
├── privacy-policy/page.tsx           # Privacy policy
│
├── (auth)/                           # Centered auth shell
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── signup/
│       ├── page.tsx                  # "I'm a Patient" / "I'm a Doctor" chooser
│       ├── patient/page.tsx          # Patient signup (name, email, dob — no KYC)
│       └── doctor/page.tsx           # Doctor signup: profile, photo, KYC
│
└── (dashboard)/                      # Sidebar + topbar shell (role-aware nav)
    ├── layout.tsx                    # Renders VerificationBanner for pending/rejected users
    ├── dashboard/
    │   ├── patient/
    │   │   ├── page.tsx              # Profile + assigned doctor
    │   │   ├── doctors/page.tsx      # Directory of verified doctors, filters, Request button
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
            ├── page.tsx              # All patients table
            └── [patientId]/page.tsx  # Patient detail, verify/reject/ban

components/
├── About.tsx, Footer.tsx, Herosection.tsx, Mission.tsx,     # Marketing sections
│   Navbar.tsx, Pricing.tsx, Services.tsx, Testimonials.tsx,
│   Therapists.tsx
│
├── auth/
│   └── KycFields.tsx                 # ID type/number/document fields (doctor signup only)
│
├── dashboard/
│   ├── Sidebar.tsx, DashboardTopbar.tsx   # Dashboard shell chrome, role-aware nav
│   ├── StatCard.tsx                       # Metric tile (admin overview)
│   ├── PatientList.tsx, DoctorList.tsx    # Tables — DoctorList has "admin" and "directory" variants
│   ├── DoctorAvatar.tsx                   # Doctor photo with initials fallback
│   ├── StatusBadge.tsx                    # Verified/Pending/Rejected/Banned badge
│   ├── VerificationBanner.tsx             # "pending verification" banner
│   └── VerificationActions.tsx            # Admin verify/reject/ban/unban buttons
│
├── messaging/
│   ├── ChatWindow.tsx                # Poll-based chat view; text + image messages, back button
│   ├── ConversationListItem.tsx      # WhatsApp-style chat list row
│   └── MessageInput.tsx              # Text input + image attach/preview
│
└── ui/                                # shadcn/ui primitives (button, card, input, checkbox,
                                        # dialog, table, tabs, select, sheet, avatar, etc.)

hooks/
├── useRequireRole.ts                 # Client-side route guard by role
└── usePolling.ts                     # setInterval hook used by ChatWindow

lib/
├── types.ts                          # Role, User, Patient, Doctor, Assignment, Conversation, Message
├── routes.ts                         # dashboardPathFor(role) + path constants
├── utils.ts                          # cn(), initials(), fileToDataUrl(), formatRelativeTimestamp()
├── services-data.tsx                 # Marketing services content
│
├── auth/
│   ├── auth-context.tsx              # AuthProvider / useAuth (signup, login, session)
│   └── mock-db.ts                    # localStorage-backed user store + seed accounts (versioned)
│
├── assignments.ts                    # Assignment CRUD: request/accept/decline, the one-active guard
├── patients-data.ts                  # getAllPatients, getPatientById, getDoctorForPatient
├── doctors-data.ts                   # getAllDoctors, getVerifiedDoctors, getPatientsForDoctor,
│                                      # getRequestedAssignmentsForDoctor, pickFallbackDoctor
├── messaging.ts                      # Conversations/messages CRUD, previews, platform stats (versioned)
└── admin-actions.ts                  # verifyUser, rejectUser, banUser, unbanUser
```

## Notes

- **Mock auth is not secure**: passwords are stored in plaintext and route protection (`useRequireRole`) only runs client-side. Both must be replaced before any real deployment.
- All mock data lives in the browser's `localStorage`. Seed data is versioned (`lib/auth/mock-db.ts`, `lib/messaging.ts`) — if those shapes change again, bump the version constant so stale browser data gets replaced instead of silently drifting out of sync with the types.
- Uploaded images (doctor profile photos, chat attachments) are stored as base64 data URLs directly in `localStorage`, with client-side size caps (1.5MB profile photos, 3MB chat images) to avoid blowing the storage quota. A real backend would use actual file storage instead.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
