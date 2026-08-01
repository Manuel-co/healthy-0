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

const LoginSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email address.").required("Email is required."),
  password: Yup.string().required("Password is required."),
});

export default function LoginPage() {
  const { logIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const user = await logIn(values.email, values.password);
        router.push(dashboardPathFor(user.role));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setSubmitting(false);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Welcome back to HealthyZero.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
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
            {formik.isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="text-center text-sm text-[#071938]/60 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#071938] font-semibold underline underline-offset-2">
            Sign up
          </Link>
        </p>
        <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium text-[#071938]">Demo accounts (password: password123)</p>
          <p>Doctor — doctor@healthyzero.dev</p>
          <p>Patient — patient@healthyzero.dev</p>
          <p>Admin — admin@healthyzero.dev</p>
        </div>
      </CardContent>
    </Card>
  );
}
