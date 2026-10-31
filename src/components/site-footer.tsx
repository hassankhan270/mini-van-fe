import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary-foreground">
          <Logo className="size-8" />
          Roamly
        </Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/fleet" className="hover:text-primary-foreground">Fleet</Link>
          <Link href="/#how-it-works" className="hover:text-primary-foreground">How it works</Link>
          <Link href="/#contact" className="hover:text-primary-foreground">Contact</Link>
          <Link href="#" className="hover:text-primary-foreground">Privacy</Link>
        </nav>
        <p className="text-xs text-primary-foreground/50">
          © 2026 Roamly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
