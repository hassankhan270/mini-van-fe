import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertCircleIcon, CheckIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VanImage } from "@/components/van-image";
import { BookingPanel } from "@/components/booking-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/reveal";
import { getVan } from "@/lib/api";

export default function VanDetailPage({ params }: PageProps<"/fleet/[vanId]">) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<VanDetailSkeleton />}>
          <VanDetailContent params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function VanDetailContent({ params }: { params: PageProps<"/fleet/[vanId]">["params"] }) {
  const { vanId } = await params;

  let van;
  try {
    van = await getVan(vanId);
  } catch {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-20 text-center text-muted-foreground sm:px-6">
        <AlertCircleIcon className="size-6" />
        <p className="font-medium text-foreground">Couldn&apos;t load this van</p>
        <p className="max-w-sm text-sm">
          The API didn&apos;t respond. Make sure the backend is running and reachable at the configured API URL.
        </p>
      </div>
    );
  }
  if (!van) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
      <Reveal className="flex flex-col gap-6">
        <VanImage src={van.imageUrl} alt={van.name} className="h-72 w-full rounded-xl" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{van.name}</h1>
          <p className="max-w-prose text-muted-foreground">{van.description}</p>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Rental policies</h2>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-success" /> Free cancellation up to 24h before pickup
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-success" /> Full insurance included
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-success" /> 24/7 roadside assistance
            </li>
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
        <BookingPanel van={van} />
      </Reveal>
    </div>
  );
}

function VanDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
