"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircleIcon, BadgeDollarSignIcon, CalendarCheckIcon, LockIcon, TruckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReservationTypeFilter } from "@/components/reservation-type-filter";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useAdminAuth } from "@/components/admin-auth";
import {
  ApiRequestError,
  getReservations,
  getVans,
  rentalDays,
  todayLocalISO,
  type Reservation,
  type Van,
  type VehicleType,
} from "@/lib/api";

function isActive(r: Reservation) {
  const today = todayLocalISO();
  return today >= r.startDate && today <= r.endDate;
}

export default function AdminPage() {
  const { token, logout } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type = typeParam === "van" || typeParam === "bus" ? (typeParam as VehicleType) : undefined;

  const [vans, setVans] = useState<Van[] | null>(null);
  const [allReservations, setAllReservations] = useState<Reservation[] | null>(null);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function load() {
      setError(false);
      try {
        const [vansRes, allRes] = await Promise.all([getVans(), getReservations(token!)]);
        const filteredRes = type ? await getReservations(token!, { type }) : allRes;
        if (cancelled) return;
        setVans(vansRes);
        setAllReservations(allRes);
        setFilteredReservations(filteredRes);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiRequestError && err.status === 401) {
          logout();
          router.replace("/admin/login");
          return;
        }
        setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, type, logout, router]);

  return (
    <div className="px-6 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard overview</h1>
      <p className="mt-1 text-muted-foreground">All reservations across the fleet.</p>

      {error && (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <AlertCircleIcon className="size-6" />
          <p className="font-medium text-foreground">Couldn&apos;t load dashboard data</p>
          <p className="max-w-sm text-sm">
            The API didn&apos;t respond. Make sure the backend is running and reachable at the configured API URL.
          </p>
        </div>
      )}

      {!error && (!vans || !allReservations || !filteredReservations) && <AdminSkeleton />}

      {!error && vans && allReservations && filteredReservations && (
        <AdminOverviewBody vans={vans} allReservations={allReservations} filteredReservations={filteredReservations} />
      )}
    </div>
  );
}

function AdminOverviewBody({
  vans,
  allReservations,
  filteredReservations,
}: {
  vans: Van[];
  allReservations: Reservation[];
  filteredReservations: Reservation[];
}) {
  const activeRentals = allReservations.filter(isActive).length;
  const totalRevenue = allReservations.reduce(
    (sum, r) => sum + rentalDays(r.startDate, r.endDate) * r.van.pricePerDay,
    0,
  );

  const stats = [
    { icon: CalendarCheckIcon, label: "Total bookings", value: allReservations.length },
    { icon: TruckIcon, label: "Total vehicles", value: vans.length },
    { icon: LockIcon, label: "Active rentals", value: activeRentals },
    { icon: BadgeDollarSignIcon, label: "Total revenue", value: `$${totalRevenue.toLocaleString()}` },
  ];

  return (
    <div className="mt-6 flex flex-col gap-6">
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <RevealItem
            key={s.label}
            className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <s.icon className="size-4.5" />
            </span>
            <div>
              <p className="font-mono text-lg font-semibold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Reservations</h2>
          <ReservationTypeFilter />
        </div>

        {filteredReservations.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No reservations match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Vehicle</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Pickup</th>
                  <th className="pb-2 font-medium">Return</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
                    <td className="py-2.5">
                      <Link href={`/admin/reservations/${r.id}`} className="font-medium hover:text-brand">
                        {r.customerName}
                      </Link>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{r.van.name}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="capitalize text-muted-foreground">
                        {r.van.type}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-mono text-xs">{r.startDate}</td>
                    <td className="py-2.5 font-mono text-xs">{r.endDate}</td>
                    <td className="py-2.5">
                      <Badge
                        variant="outline"
                        className={r.isLocked ? "border-success/30 bg-success/10 text-success" : "text-muted-foreground"}
                      >
                        {r.isLocked ? "Locked" : "Unlocked"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
