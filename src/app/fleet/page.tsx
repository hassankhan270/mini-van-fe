import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FleetBrowser } from "@/components/fleet-browser";

export const metadata = {
  title: "Explore the Fleet — Roamly",
};

export default function FleetPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-secondary/40 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h1 className="text-3xl font-semibold tracking-tight">Explore our fleet</h1>
            <p className="mt-1 text-muted-foreground">Find the perfect van for your journey.</p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Suspense fallback={null}>
            <FleetBrowser />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
