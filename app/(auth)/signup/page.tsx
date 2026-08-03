import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a HealthyZero account as a patient or a doctor.",
};

export default function SignupChooserPage() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h1 className="font-heading text-2xl font-extrabold text-[#071938]">Create your account</h1>
        <p className="text-sm text-[#071938]/60 mt-1">Choose how you&apos;d like to join HealthyZero.</p>
      </div>

      <Link href="/signup/patient" className="block">
        <Card className="hover:border-[#071938] transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle>I&apos;m a Patient</CardTitle>
            <CardDescription>Get matched with a licensed doctor and manage your care.</CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/signup/doctor" className="block">
        <Card className="hover:border-[#071938] transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle>I&apos;m a Doctor</CardTitle>
            <CardDescription>Join the platform to see and message your patients.</CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <div className="text-center text-sm text-[#071938]/60 pt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-[#071938] font-semibold underline underline-offset-2">
          Log in
        </Link>
      </div>
    </div>
  );
}
