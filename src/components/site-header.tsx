import Link from "next/link";
import { CaravanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

export const navLinks = [
  { href: "/fleet", label: "Fleet" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <CaravanIcon className="size-5 text-brand" />
          Roamly
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-primary-foreground/80 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            render={<Link href="/fleet">Book now</Link>}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
