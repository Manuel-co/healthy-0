"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor } from "@/lib/routes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { KycFields } from "@/components/auth/KycFields";
import { fileToDataUrl, initials } from "@/lib/utils";
import type { KycInfo } from "@/lib/types";

const EMPTY_KYC: KycInfo = { idType: "", idNumber: "", documentName: "" };
const MAX_IMAGE_BYTES = 1_500_000;

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DoctorSignupPage() {
  const { signUpDoctor } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [languages, setLanguages] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");
  const [acceptingNewPatients, setAcceptingNewPatients] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [kyc, setKyc] = useState<KycInfo>(EMPTY_KYC);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleProfileImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Profile photo must be smaller than 1.5MB.");
      return;
    }
    setError(null);
    setProfileImageUrl(await fileToDataUrl(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const doctor = await signUpDoctor({
        name,
        email,
        password,
        specialty,
        licenseNumber,
        focusAreas: splitList(focusAreas),
        languages: splitList(languages),
        yearsExperience: Number(yearsExperience) || 0,
        bio,
        acceptingNewPatients,
        profileImageUrl,
        kyc,
      });
      router.push(dashboardPathFor(doctor.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign up as a Doctor</CardTitle>
        <CardDescription>Join the platform to see and message your patients.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profileImage">Profile photo</Label>
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                {profileImageUrl && <AvatarImage src={profileImageUrl} alt="Profile preview" />}
                <AvatarFallback>{name ? initials(name) : "DR"}</AvatarFallback>
              </Avatar>
              <Input id="profileImage" type="file" accept="image/*" onChange={handleProfileImageChange} />
            </div>
            <p className="text-xs text-muted-foreground">Shown to patients browsing doctors. Optional, up to 1.5MB.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              required
              placeholder="e.g. Clinical Psychology"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="license">License number</Label>
            <Input
              id="license"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="focusAreas">Focus areas</Label>
            <Input
              id="focusAreas"
              required
              placeholder="e.g. Anxiety, Depression, Trauma"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated — shown to patients browsing doctors.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="languages">Languages spoken</Label>
            <Input
              id="languages"
              required
              placeholder="e.g. English, Yoruba"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearsExperience">Years of experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              min={0}
              required
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              required
              placeholder="A short introduction patients will see on your profile."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="acceptingNewPatients"
              checked={acceptingNewPatients}
              onCheckedChange={(checked) => setAcceptingNewPatients(checked === true)}
            />
            <Label htmlFor="acceptingNewPatients" className="font-normal">
              I&apos;m currently accepting new patients
            </Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <KycFields value={kyc} onChange={setKyc} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="text-center text-sm text-[#071938]/60 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#071938] font-semibold underline underline-offset-2">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
