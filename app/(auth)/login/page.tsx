"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardPathFor } from "@/lib/routes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { logIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await logIn(email, password);
      router.push(dashboardPathFor(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Welcome back to HealthyZero.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
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
