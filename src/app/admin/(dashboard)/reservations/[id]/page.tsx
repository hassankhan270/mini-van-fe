import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { VanImage } from "@/components/van-image";
import { LockToggle } from "@/components/lock-toggle";
import { Reveal } from "@/components/motion/reveal";
import { getReservation, rentalDays } from "@/lib/api";

export default function ReservationDetailPage({ params }: PageProps<"/admin/reservations/[id]">) {
  return (
    <div className="px-6 py-8 sm:px-8">
      <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-3.5" /> Back to overview
      </Link>
      <Suspense fallback={<ReservationSkeleton />}>
        <ReservationDetailContent params={params} />
      </Suspense>
    </div>
  );
}

function ReservationSkeleton() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

async function ReservationDetailContent({
  params,
}: {
  params: PageProps<"/admin/reservations/[id]">["params"];
}) {
  const { id } = await params;

  let reservation;
  try {
    reservation = await getReservation(id);
  } catch {
    return (
      <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
        <AlertCircleIcon className="size-6" />
        <p className="font-medium text-foreground">Couldn&apos;t load this reservation</p>
        <p className="max-w-sm text-sm">The API didn&apos;t respond. Make sure the backend is reachable.</p>
      </div>
    );
  }
  if (!reservation) notFound();

  const days = rentalDays(reservation.startDate, reservation.endDate);
  const total = days * reservation.van.pricePerDay;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Reveal className="flex flex-col gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex items-center gap-4">
          <VanImage src={reservation.van.imageUrl} alt={reservation.van.name} className="size-16 shrink-0 rounded-lg" />
          <div>
            <h1 className="text-lg font-semibold">{reservation.van.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{reservation.id}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-medium">{reservation.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{reservation.customerEmail}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{reservation.customerPhone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pickup</p>
            <p className="font-mono font-medium">{reservation.startDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Return</p>
            <p className="font-mono font-medium">{reservation.endDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-mono font-medium">${total} <span className="text-muted-foreground">({days}d)</span></p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="font-semibold">Vehicle lock</h2>
        <LockToggle reservation={reservation} />
      </Reveal>
    </div>
  );
}
