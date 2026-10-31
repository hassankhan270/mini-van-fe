import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { VanImage } from "@/components/van-image";
import type { Van } from "@/lib/api";

export function VanCard({ van }: { van: Van }) {
  return (
    <Card className="group gap-4 overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5">
      <div className="relative">
        <VanImage
          src={van.imageUrl}
          alt={van.name}
          className="h-40 w-full transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <Badge className="absolute left-2 top-2 bg-card/90 text-foreground backdrop-blur-sm">
          {van.type === "bus" ? "Bus" : "Van"}
        </Badge>
      </div>
      <CardHeader className="gap-1">
        <h3 className="font-semibold text-lg leading-tight">{van.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{van.description}</p>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <p className="font-mono text-lg font-semibold">
          ${van.pricePerDay}
          <span className="font-sans text-sm font-normal text-muted-foreground">
            /day
          </span>
        </p>
        <Button
          variant="link"
          className="h-auto p-0 text-foreground"
          render={
            <Link href={`/fleet/${van.id}`} className="group/link">
              View details{" "}
              <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
            </Link>
          }
        />
      </CardFooter>
    </Card>
  );
}
