"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { login as apiLogin } from "@/lib/api";

const STORAGE_KEY = "admin_token";

export type AdminUser = {
  email: string;
  role: string;
};

function decodeToken(token: string): AdminUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    console.log("Decoded token payload:", payload);
    if (typeof payload.email !== "string") return null;
    return { email: payload.email, role: typeof payload.role === "string" ? payload.role : "admin" };
  } catch {
    return null;
  }
}

type AuthContextValue = {
  token: string | null;
  user: AdminUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      // sessionStorage unavailable (private mode, etc.) — treat as logged out
    }
    setReady(true);
  }, []);

  async function login(username: string, password: string) {
    const { accessToken } = await apiLogin(username, password);
    setToken(accessToken);
    try {
      sessionStorage.setItem(STORAGE_KEY, accessToken);
    } catch {
      // ignore storage failure, token still works for this tab's session
    }
  }

  function logout() {
    setToken(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return <AuthContext.Provider value={{ token, user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) router.replace("/admin/login");
  }, [ready, token, router]);

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
