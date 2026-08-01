"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor } from "@/lib/routes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const TODAY = new Date().toISOString().slice(0, 10);

const PatientSignupSchema = Yup.object({
  name: Yup.string().trim().required("Full name is required."),
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
  dob: Yup.date()
    .typeError("Enter a valid date.")
    .max(new Date(), "Date of birth can't be in the future.")
    .required("Date of birth is required."),
  password: Yup.string().min(6, "Password must be at least 6 characters.").required("Password is required."),
});

export default function PatientSignupPage() {
  const { signUpPatient } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { name: "", email: "", dob: "", password: "" },
    validationSchema: PatientSignupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const patient = await signUpPatient(values);
        router.push(dashboardPathFor(patient.role));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setSubmitting(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign up as a Patient</CardTitle>
        <CardDescription>Create your account to get matched with a doctor.</CardDescription>
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
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              max={TODAY}
              value={formik.values.dob}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.dob && formik.errors.dob)}
            />
            {formik.touched.dob && formik.errors.dob && (
              <p className="text-sm text-destructive">{formik.errors.dob}</p>
            )}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
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
