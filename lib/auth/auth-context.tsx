"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "@/lib/auth/mock-db";
import { pickFallbackDoctor } from "@/lib/doctors-data";
import { createAssignment } from "@/lib/assignments";
import type { Doctor, KycInfo, Patient, User } from "@/lib/types";

const SESSION_KEY = "hz_session";

// Async-shaped to mirror a future Supabase `auth.getSession()` call.
async function restoreSession(): Promise<User | null> {
  const sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  return findUserById(sessionId) ?? null;
}

interface PatientSignupInput {
  name: string;
  email: string;
  password: string;
  dob: string;
}

interface DoctorSignupInput {
  name: string;
  email: string;
  password: string;
  specialty: string;
  licenseNumber: string;
  focusAreas: string[];
  languages: string[];
  yearsExperience: number;
  bio: string;
  acceptingNewPatients: boolean;
  profileImageUrl: string | null;
  kyc: KycInfo;
}

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  signUpPatient: (input: PatientSignupInput) => Promise<Patient>;
  signUpDoctor: (input: DoctorSignupInput) => Promise<Doctor>;
  logIn: (email: string, password: string) => Promise<User>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession().then((user) => {
      if (user) setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  function startSession(user: User) {
    window.localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUser(user);
  }

  async function signUpPatient(input: PatientSignupInput): Promise<Patient> {
    if (findUserByEmail(input.email)) {
      throw new Error("An account with this email already exists.");
    }
    const patient: Patient = {
      id: `patient-${Date.now()}`,
      role: "patient",
      name: input.name,
      email: input.email,
      password: input.password,
      createdAt: new Date().toISOString(),
      dob: input.dob,
      banned: false,
      verificationStatus: "pending",
      rejectionReason: null,
    };
    createUser(patient);
    // Discovery/request is patient-led (see the doctor directory); this is only
    // a safety net so nobody is left without a doctor if they skip that step.
    const fallbackDoctor = await pickFallbackDoctor();
    if (fallbackDoctor) {
      await createAssignment(patient.id, fallbackDoctor.id, "active");
    }
    startSession(patient);
    return patient;
  }

  async function signUpDoctor(input: DoctorSignupInput): Promise<Doctor> {
    if (findUserByEmail(input.email)) {
      throw new Error("An account with this email already exists.");
    }
    const doctor: Doctor = {
      id: `doctor-${Date.now()}`,
      role: "doctor",
      name: input.name,
      email: input.email,
      password: input.password,
      createdAt: new Date().toISOString(),
      specialty: input.specialty,
      licenseNumber: input.licenseNumber,
      focusAreas: input.focusAreas,
      languages: input.languages,
      yearsExperience: input.yearsExperience,
      bio: input.bio,
      acceptingNewPatients: input.acceptingNewPatients,
      profileImageUrl: input.profileImageUrl,
      banned: false,
      verificationStatus: "pending",
      rejectionReason: null,
      kyc: input.kyc,
    };
    createUser(doctor);
    startSession(doctor);
    return doctor;
  }

  async function logIn(email: string, password: string): Promise<User> {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password.");
    }
    if (user.banned) {
      throw new Error("This account has been banned. Contact support for details.");
    }
    startSession(user);
    return user;
  }

  function logOut() {
    window.localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, signUpPatient, signUpDoctor, logIn, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
