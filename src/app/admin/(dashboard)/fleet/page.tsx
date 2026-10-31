"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircleIcon } from "lucide-react";
import { AddVanForm } from "@/components/add-van-form";
import { VanRow } from "@/components/van-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/components/admin-auth";
import { ApiRequestError, getVans, type Van } from "@/lib/api";

export default function AdminFleetPage() {
  const { token, logout } = useAdminAuth();
  const router = useRouter();
  const [vans, setVans] = useState<Van[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    getVans()
      .then((result) => {
        if (!cancelled) setVans(result);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiRequestError && err.status === 401) {
          logout();
          router.replace("/admin/login");
          return;
        }
        setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout, router]);

  if (!token) return null;

  return (
    <div className="px-6 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Fleet management</h1>
      <p className="mt-1 text-muted-foreground">Add vans, edit their details, or update a listing photo.</p>

      <div className="mt-6 flex flex-col gap-4">
        <AddVanForm
          token={token}
          onCreated={(van) => setVans((prev) => (prev ? [van, ...prev] : [van]))}
          onUpdated={(van) => setVans((prev) => prev?.map((v) => (v.id === van.id ? van : v)) ?? prev)}
        />

        {error && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <AlertCircleIcon className="size-6" />
            <p className="font-medium text-foreground">Couldn&apos;t load the fleet</p>
            <p className="max-w-sm text-sm">The API didn&apos;t respond. Make sure the backend is reachable.</p>
          </div>
        )}

        {!error && !vans && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        )}

        {!error && vans && vans.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No vans yet — add your first one above.
          </p>
        )}

        <AnimatePresence initial={false}>
          {!error &&
            vans &&
            vans.map((van) => (
              <motion.div
                key={van.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <VanRow
                  van={van}
                  token={token}
                  onChanged={(updated) => setVans((prev) => prev!.map((v) => (v.id === updated.id ? updated : v)))}
                  onDeleted={(id) => setVans((prev) => prev!.filter((v) => v.id !== id))}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
