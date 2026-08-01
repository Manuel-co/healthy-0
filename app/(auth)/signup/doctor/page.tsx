"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor } from "@/lib/routes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { KycFields } from "@/components/auth/KycFields";
import { FocusAreaPicker } from "@/components/FocusAreaPicker";
import { fileToDataUrl, initials } from "@/lib/utils";
import type { KycInfo } from "@/lib/types";

const EMPTY_KYC: KycInfo = { idType: "", idNumber: "", documentName: "" };
const MAX_IMAGE_BYTES = 1_500_000;

const DoctorSignupSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required."),
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
  specialty: Yup.string().trim().required("Specialty is required."),
  licenseNumber: Yup.string().trim().required("License number is required."),
  focusAreas: Yup.array().of(Yup.string().required()).min(1, "Pick at least one focus area."),
  languages: Yup.string().trim().required("List at least one language."),
  yearsExperience: Yup.number()
    .typeError("Enter a number.")
    .min(0, "Can't be negative.")
    .required("Years of experience is required."),
  bio: Yup.string().trim().required("Bio is required."),
  password: Yup.string().min(6, "Password must be at least 6 characters.").required("Password is required."),
  kyc: Yup.object({
    idType: Yup.string().required("Select an ID type."),
    idNumber: Yup.string().trim().required("ID number is required."),
    documentName: Yup.string().required("Upload an ID document."),
  }),
});

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DoctorSignupPage() {
  const { signUpDoctor } = useAuth();
  const router = useRouter();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      specialty: "",
      licenseNumber: "",
      focusAreas: [] as string[],
      languages: "",
      yearsExperience: "",
      bio: "",
      acceptingNewPatients: true,
      password: "",
      kyc: EMPTY_KYC,
    },
    validationSchema: DoctorSignupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError(null);
      try {
        const doctor = await signUpDoctor({
          name: values.name,
          email: values.email,
          password: values.password,
          specialty: values.specialty,
          licenseNumber: values.licenseNumber,
          focusAreas: values.focusAreas,
          languages: splitList(values.languages),
          yearsExperience: Number(values.yearsExperience) || 0,
          bio: values.bio,
          acceptingNewPatients: values.acceptingNewPatients,
          profileImageUrl,
          kyc: values.kyc,
        });
        router.push(dashboardPathFor(doctor.role));
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
        setSubmitting(false);
      }
    },
  });

  async function handleProfileImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Profile photo must be smaller than 1.5MB.");
      return;
    }
    setImageError(null);
    setProfileImageUrl(await fileToDataUrl(file));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign up as a Doctor</CardTitle>
        <CardDescription>Join the platform to see and message your patients.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.name && formik.errors.name)}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profileImage">Profile photo</Label>
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                {profileImageUrl && <AvatarImage src={profileImageUrl} alt="Profile preview" />}
                <AvatarFallback>{formik.values.name ? initials(formik.values.name) : "DR"}</AvatarFallback>
              </Avatar>
              <Input id="profileImage" type="file" accept="image/*" onChange={handleProfileImageChange} />
            </div>
            <p className="text-xs text-muted-foreground">Shown to patients browsing doctors. Optional, up to 1.5MB.</p>
            {imageError && <p className="text-sm text-destructive">{imageError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.email && formik.errors.email)}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-destructive">{formik.errors.email}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              name="specialty"
              placeholder="e.g. Clinical Psychology"
              value={formik.values.specialty}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.specialty && formik.errors.specialty)}
            />
            {formik.touched.specialty && formik.errors.specialty && (
              <p className="text-sm text-destructive">{formik.errors.specialty}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="license">License number</Label>
            <Input
              id="license"
              name="licenseNumber"
              value={formik.values.licenseNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.licenseNumber && formik.errors.licenseNumber)}
            />
            {formik.touched.licenseNumber && formik.errors.licenseNumber && (
              <p className="text-sm text-destructive">{formik.errors.licenseNumber}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Focus areas</Label>
            <p className="text-xs text-muted-foreground">
              Shown to patients browsing doctors, and used to match patients to you.
            </p>
            <FocusAreaPicker
              value={formik.values.focusAreas}
              onChange={(focusAreas) => {
                formik.setFieldValue("focusAreas", focusAreas);
                formik.setFieldTouched("focusAreas", true);
              }}
            />
            {formik.touched.focusAreas && formik.errors.focusAreas && (
              <p className="text-sm text-destructive">{formik.errors.focusAreas as string}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="languages">Languages spoken</Label>
            <Input
              id="languages"
              name="languages"
              placeholder="e.g. English, Yoruba"
              value={formik.values.languages}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.languages && formik.errors.languages)}
            />
            {formik.touched.languages && formik.errors.languages && (
              <p className="text-sm text-destructive">{formik.errors.languages}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearsExperience">Years of experience</Label>
            <Input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              min={0}
              value={formik.values.yearsExperience}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.yearsExperience && formik.errors.yearsExperience)}
            />
            {formik.touched.yearsExperience && formik.errors.yearsExperience && (
              <p className="text-sm text-destructive">{formik.errors.yearsExperience}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="A short introduction patients will see on your profile."
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.bio && formik.errors.bio)}
            />
            {formik.touched.bio && formik.errors.bio && (
              <p className="text-sm text-destructive">{formik.errors.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="acceptingNewPatients"
              checked={formik.values.acceptingNewPatients}
              onCheckedChange={(checked) => formik.setFieldValue("acceptingNewPatients", checked === true)}
            />
            <Label htmlFor="acceptingNewPatients" className="font-normal">
              I&apos;m currently accepting new patients
            </Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.password && formik.errors.password)}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-destructive">{formik.errors.password}</p>
            )}
          </div>
          <KycFields
            value={formik.values.kyc}
            onChange={(kyc) => {
              formik.setFieldValue("kyc", kyc);
              formik.setFieldTouched("kyc.idType", true);
              formik.setFieldTouched("kyc.idNumber", true);
              formik.setFieldTouched("kyc.documentName", true);
            }}
            errors={formik.touched.kyc ? (formik.errors.kyc as Record<string, string> | undefined) : undefined}
          />
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Creating account..." : "Create account"}
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
