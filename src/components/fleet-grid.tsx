import { AlertCircleIcon } from "lucide-react";
import { VanCard } from "@/components/van-card";
import { Skeleton } from "@/components/ui/skeleton";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getVans } from "@/lib/api";

export async function FleetGrid({ limit }: { limit?: number }) {
  let vans;
  try {
    vans = await getVans();
  } catch {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        <AlertCircleIcon className="size-6" />
        <p className="font-medium text-foreground">Couldn&apos;t load the fleet</p>
        <p className="max-w-sm text-sm">
          The API didn&apos;t respond. Make sure the backend is running and reachable at the configured API URL.
        </p>
      </div>
    );
  }

  const shown = limit ? vans.slice(0, limit) : vans;

  if (shown.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        No vans available right now.
      </p>
    );
  }

  return (
    <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((van) => (
        <RevealItem key={van.id}>
          <VanCard van={van} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function FleetGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl ring-1 ring-foreground/10">
          <Skeleton className="h-40 rounded-t-xl rounded-b-none" />
          <div className="flex flex-col gap-2 px-4 pb-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
