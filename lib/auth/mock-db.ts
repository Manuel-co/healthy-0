import type { Admin, Doctor, Patient, Subscription, User } from "@/lib/types";

type UserPatch = Partial<Patient> & Partial<Doctor> & Partial<Admin>;

const USERS_KEY = "hz_users";
const SEED_VERSION_KEY = "hz_users_seed_version";
// Bump this whenever seedUsers()'s shape changes, so stale localStorage data
// from an earlier session (missing newer User fields) gets replaced instead
// of silently drifting out of sync with the current types.
const SEED_VERSION = "7";

function seedUsers(): User[] {
  return [
    {
      id: "doctor-1",
      role: "doctor",
      name: "Dr. Amara Okafor",
      email: "doctor@healthyzero.dev",
      password: "password123",
      createdAt: "2026-01-10T09:00:00.000Z",
      specialty: "Clinical Psychology",
      licenseNumber: "LIC-10293",
      focusAreas: ["Anxiety", "Depression", "Trauma"],
      languages: ["English", "Yoruba"],
      yearsExperience: 9,
      bio: "I help clients build practical, sustainable coping strategies for anxiety and mood disorders.",
      acceptingNewPatients: true,
      profileImageUrl: null,
      banned: false,
      verificationStatus: "verified",
      rejectionReason: null,
      kyc: { idType: "National ID", idNumber: "NID-771029", documentName: "amara-id.pdf" },
    },
    {
      id: "doctor-2",
      role: "doctor",
      name: "Dr. Femi Adeyemi",
      email: "femi@healthyzero.dev",
      password: "password123",
      createdAt: "2026-01-12T09:00:00.000Z",
      specialty: "Psychiatry",
      licenseNumber: "LIC-88213",
      focusAreas: ["Medication management", "Bipolar disorder"],
      languages: ["English", "Hausa"],
      yearsExperience: 6,
      bio: "Board-certified psychiatrist focused on medication management alongside talk therapy.",
      acceptingNewPatients: true,
      profileImageUrl: null,
      banned: false,
      verificationStatus: "pending",
      rejectionReason: null,
      kyc: { idType: "Passport", idNumber: "P-4471203", documentName: "femi-passport.pdf" },
    },
    {
      id: "patient-1",
      role: "patient",
      name: "Jordan Reyes",
      email: "patient@healthyzero.dev",
      password: "password123",
      createdAt: "2026-01-15T09:00:00.000Z",
      dob: "1994-05-12",
      presentingConcern: "Ongoing anxiety around work deadlines and difficulty sleeping.",
      banned: false,
      verificationStatus: "verified",
      rejectionReason: null,
      subscription: { tier: "basic", cycleStartDate: "2026-01-15T09:00:00.000Z", status: "active" },
      intake: {
        focusAreas: ["Anxiety", "Sleep"],
        preferredLanguage: "English",
        urgency: "medium",
        completedAt: "2026-01-15T09:00:00.000Z",
      },
      unmatchedFlag: null,
    },
    {
      id: "patient-2",
      role: "patient",
      name: "Sam Ibrahim",
      email: "sam@healthyzero.dev",
      password: "password123",
      createdAt: "2026-01-18T09:00:00.000Z",
      dob: "1989-11-02",
      presentingConcern: "Feeling low motivation and wanting support adjusting to a recent move.",
      banned: false,
      verificationStatus: "pending",
      rejectionReason: null,
      subscription: { tier: "pro", cycleStartDate: "2026-01-18T09:00:00.000Z", status: "active" },
      intake: {
        focusAreas: ["Depression"],
        preferredLanguage: "English",
        urgency: "low",
        completedAt: "2026-01-18T09:00:00.000Z",
      },
      unmatchedFlag: null,
    },
    {
      id: "admin-1",
      role: "admin",
      name: "Platform Admin",
      email: "admin@healthyzero.dev",
      password: "password123",
      createdAt: "2026-01-01T09:00:00.000Z",
      banned: false,
    },
  ];
}

function defaultSubscription(): Subscription {
  return { tier: "basic", cycleStartDate: new Date().toISOString(), status: "active" };
}

/** Fields a Patient record might be missing if it was created before that field existed. */
function backfillPatient(u: Patient): { patient: Patient; changed: boolean } {
  let changed = false;
  let patient = u;
  if (!patient.subscription) {
    changed = true;
    patient = { ...patient, subscription: defaultSubscription() };
  }
  if (patient.intake === undefined) {
    changed = true;
    patient = { ...patient, intake: null };
  }
  if (patient.unmatchedFlag === undefined) {
    changed = true;
    patient = { ...patient, unmatchedFlag: null };
  }
  return { patient, changed };
}

/**
 * A version bump only replaces the fixed seed users — a real account created
 * before a field existed (e.g. a patient signed up before `subscription` or
 * `intake` was added) survives every reseed untouched, since reseeding is
 * all-or-nothing at the array level, not per-record. This repairs any such
 * record in place so the rest of the app never has to defend against a
 * missing field.
 */
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  const seededAtVersion = window.localStorage.getItem(SEED_VERSION_KEY);
  if (!raw || seededAtVersion !== SEED_VERSION) {
    const seeded = seedUsers();
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
    window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    return seeded;
  }

  let backfilled = false;
  const users = (JSON.parse(raw) as User[]).map((u): User => {
    if (u.role !== "patient") return u;
    const { patient, changed } = backfillPatient(u);
    if (changed) backfilled = true;
    return patient;
  });
  if (backfilled) saveUsers(users);
  return users;
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function createUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(id: string, patch: UserPatch): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return;
  users[index] = { ...users[index], ...patch } as User;
  saveUsers(users);
}
