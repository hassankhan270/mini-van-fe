import { Suspense } from "react";
import Link from "next/link";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConfirmationCard } from "@/components/confirmation-card";
import { getReservation, rentalDays } from "@/lib/api";

export default function ConfirmationPage({ searchParams }: PageProps<"/confirmation">) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <Suspense fallback={<ConfirmationSkeleton />}>
          <ConfirmationContent searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">No booking to show</h1>
      <p className="max-w-sm text-muted-foreground">
        Start from the fleet page and complete a booking to see a confirmation here.
      </p>
      <Button render={<Link href="/fleet">Browse the fleet</Link>} className="bg-brand text-brand-foreground hover:bg-brand/90" />
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
      <Skeleton className="size-14 rounded-full" />
      <div className="flex w-full flex-col items-center gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="flex w-full items-center gap-3">
        <Skeleton className="size-14 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid w-full grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

async function ConfirmationContent({
  searchParams,
}: {
  searchParams: PageProps<"/confirmation">["searchParams"];
}) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : null;
  if (!id) return <EmptyState />;

  let reservation;
  try {
    reservation = await getReservation(id);
  } catch {
    return (
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <AlertCircleIcon className="size-6" />
        <p className="font-medium text-foreground">Couldn&apos;t load your booking</p>
        <p className="max-w-sm text-sm">
          The API didn&apos;t respond. Make sure the backend is running and reachable at the configured API URL.
        </p>
      </div>
    );
  }
  if (!reservation) return <EmptyState />;

  const days = rentalDays(reservation.startDate, reservation.endDate);
  const total = days * reservation.van.pricePerDay;
  const reference = reservation.id.split("-")[0].toUpperCase();

  return <ConfirmationCard reservation={reservation} days={days} total={total} reference={reference} />;
}
