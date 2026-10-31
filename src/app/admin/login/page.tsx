"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CaravanIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiRequestError } from "@/lib/api";
import { useAdminAuth } from "@/components/admin-auth";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.status === 401
          ? "Incorrect username or password."
          : "Couldn't sign in. Try again.",
      );
      setShake((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <motion.div
          key={shake}
          animate={shake > 0 ? { x: [0, -8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CaravanIcon className="size-5" />
            </span>
            <h1 className="text-lg font-semibold">Admin sign in</h1>
            <p className="text-sm text-muted-foreground">Manage the fleet and view reservations.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <Button type="submit" disabled={submitting} className="bg-brand text-brand-foreground hover:bg-brand/90">
              {submitting && <Loader2Icon className="size-4 animate-spin" />}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
