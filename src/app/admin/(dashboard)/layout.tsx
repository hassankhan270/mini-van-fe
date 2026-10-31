"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CaravanIcon, LayoutDashboardIcon, LogOutIcon, TruckIcon } from "lucide-react";
import { AdminAuthGate, useAdminAuth } from "@/components/admin-auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/fleet", label: "Fleet", icon: TruckIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <DashboardChrome>{children}</DashboardChrome>
    </AdminAuthGate>
  );
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:w-60">
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4 lg:px-5">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent">
              <CaravanIcon className="size-4.5 text-sidebar-primary" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-semibold tracking-tight">Roamly</span>
              <span className="mt-0.5 text-[10px] tracking-wide text-sidebar-foreground/50 uppercase">Admin</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 lg:hidden"
          >
            ← Site
          </Link>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto px-3 py-3 lg:mx-0 lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-3">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-pill"
                    className="absolute inset-0 rounded-lg bg-sidebar-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <link.icon className="relative z-10 size-4" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
              {initial}
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium">{user?.email ?? "Admin"}</span>
              <span className="text-xs text-sidebar-foreground/50 capitalize">{user?.role ?? "admin"}</span>
            </div>
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              ← Back to site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOutIcon className="size-3.5" /> Log out
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-1.5 border-t border-sidebar-border px-4 py-2.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
        >
          <LogOutIcon className="size-3.5" /> Log out ({user?.email ?? "Admin"})
        </button>
      </aside>
      <div className="flex-1 bg-secondary/30">{children}</div>
    </div>
  );
}
