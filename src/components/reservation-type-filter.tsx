"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { VehicleType } from "@/lib/api";

const options: { id: VehicleType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "van", label: "Vans" },
  { id: "bus", label: "Buses" },
];

export function ReservationTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") ?? "all";

  function select(type: VehicleType | "all") {
    const params = new URLSearchParams(searchParams);
    if (type === "all") params.delete("type");
    else params.set("type", type);
    router.push(`/admin${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = activeType === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => select(option.id)}
            className={cn(
              "relative rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive ? "border-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="reservation-type-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
