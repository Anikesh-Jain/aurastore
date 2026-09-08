"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Lock, Mail, ArrowRight, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error(res.error || "Failed to sign in. Please check your credentials.");
      } else {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (demoPass) {
      toast.info(`Filled credentials for ${demoEmail}`);
    } else {
      toast.info(`Filled email for ${demoEmail}. Please enter your password.`);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span>AuraStore</span>
        </Link>
        <p className="text-sm text-muted-foreground mt-2">
          Welcome back! Sign in to access your orders, cart, and dashboard.
        </p>
      </div>

      <Card className="shadow-lg border-border/60">
        <CardHeader>
          <CardTitle className="text-xl">Sign In</CardTitle>
          <CardDescription>Enter your account credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-3">
            <p className="text-xs text-muted-foreground font-medium text-center">
              Quick Demo Access (Click to autofill):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs flex items-center justify-center gap-1.5"
                onClick={() => handleDemoFill("admin@ecommerce.com", "Major_Project_1")}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs flex items-center justify-center gap-1.5"
                onClick={() => handleDemoFill("customer@ecommerce.com", "Customer123!")}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Customer Demo
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="ml-1 text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
