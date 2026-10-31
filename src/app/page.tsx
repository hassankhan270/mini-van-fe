import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheckIcon, HeadsetIcon, BadgeDollarSignIcon, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FleetGrid, FleetGridSkeleton } from "@/components/fleet-grid";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { HeroCopy } from "@/components/hero-copy";

const perks = [
  {
    icon: ShieldCheckIcon,
    title: "Fully insured fleet",
    description: "Every rental includes standard coverage, no surprises.",
  },
  {
    icon: HeadsetIcon,
    title: "24/7 support",
    description: "Roadside help and a real person on the phone, anytime.",
  },
  {
    icon: BadgeDollarSignIcon,
    title: "Straightforward pricing",
    description: "One daily rate. No hidden fees at pickup.",
  },
  {
    icon: WrenchIcon,
    title: "Serviced before every trip",
    description: "Inspected, cleaned, and fuelled before you get the keys.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.brand/.18),transparent_55%)]"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
            <HeroCopy />
          </div>
        </section>

        <section id="fleet" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="mb-8 flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">Our premium fleet</h2>
            <p className="text-muted-foreground">Choose from our top-rated rental vans</p>
          </Reveal>
          <Suspense fallback={<FleetGridSkeleton />}>
            <FleetGrid limit={3} />
          </Suspense>
          <Reveal delay={0.15} className="mt-8 flex justify-center">
            <Button variant="outline" render={<Link href="/fleet">View all vans</Link>} />
          </Reveal>
        </section>

        <section id="how-it-works" className="bg-secondary/40 py-16">
          <RevealGroup className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {perks.map((perk) => (
              <RevealItem key={perk.title} className="flex flex-col gap-3">
                <perk.icon className="size-6 text-brand" strokeWidth={1.75} />
                <h3 className="font-semibold">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.description}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-semibold">Ready to hit the road?</h2>
              <p className="mt-1 text-primary-foreground/75">
                Pick your van and dates — confirmation takes less than two minutes.
              </p>
            </div>
            <Button
              render={<Link href="/fleet">Browse the fleet</Link>}
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            />
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
