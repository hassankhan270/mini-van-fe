import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VanImage } from "@/components/van-image";
import { LockToggle } from "@/components/lock-toggle";
import { Reveal } from "@/components/motion/reveal";
import { getReservation, rentalDays } from "@/lib/api";

export default function ReservationDetailPage({ params }: PageProps<"/reservations/[id]">) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<DetailSkeleton />}>
          <ReservationDetailContent params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function ReservationDetailContent({
  params,
}: {
  params: PageProps<"/reservations/[id]">["params"];
}) {
  const { id } = await params;

  let reservation;
  try {
    reservation = await getReservation(id);
  } catch {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2 px-4 py-20 text-center text-muted-foreground sm:px-6">
        <AlertCircleIcon className="size-6" />
        <p className="font-medium text-foreground">Couldn&apos;t load this booking</p>
        <p className="max-w-sm text-sm">The API didn&apos;t respond. Make sure the backend is reachable.</p>
      </div>
    );
  }
  if (!reservation) notFound();

  const days = rentalDays(reservation.startDate, reservation.endDate);
  const total = days * reservation.van.pricePerDay;
  const reference = reservation.id.split("-")[0].toUpperCase();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Reveal>
        <p className="text-xs text-muted-foreground">Booking reference</p>
        <h1 className="font-mono text-2xl font-semibold tracking-wide">{reference}</h1>
      </Reveal>

      <Reveal delay={0.05} className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex items-center gap-4">
          <VanImage src={reservation.van.imageUrl} alt={reservation.van.name} className="size-16 shrink-0 rounded-lg" />
          <div>
            <p className="font-semibold">{reservation.van.name}</p>
            <p className="text-sm text-muted-foreground">Booked for {reservation.customerName}</p>
          </div>
        </div>

        <Separator />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Pickup</dt>
            <dd className="font-medium">{reservation.startDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Return</dt>
            <dd className="font-medium">{reservation.endDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rental days</dt>
            <dd className="font-medium">{days} days</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-mono font-medium">${total}</dd>
          </div>
        </dl>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div>
          <h2 className="font-semibold">Vehicle access</h2>
          <p className="text-sm text-muted-foreground">Lock or unlock your van during the rental period.</p>
        </div>
        <LockToggle reservation={reservation} />
      </Reveal>

      <p className="text-center text-xs text-muted-foreground">
        Bookmark this page to come back and manage your van during the rental.
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
