"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircleIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { VanCard } from "@/components/van-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { ApiRequestError, getAvailableVans, getVans, type Van, type VehicleType } from "@/lib/api";

const today = () => new Date().toISOString().slice(0, 10);

const typeTabs: { id: VehicleType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "van", label: "Vans" },
  { id: "bus", label: "Buses" },
];

export function FleetBrowser() {
  const [vans, setVans] = useState<Van[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [typeFilter, setTypeFilter] = useState<VehicleType | "all">("all");

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [checking, setChecking] = useState(false);
  const [filteredVans, setFilteredVans] = useState<Van[] | null>(null);
  const [appliedRange, setAppliedRange] = useState<{ pickup: string; ret: string } | null>(null);

  useEffect(() => {
    getVans()
      .then(setVans)
      .catch(() => setLoadError(true));
  }, []);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      setDateError("Choose both a pickup and return date.");
      return;
    }
    if (returnDate <= pickupDate) {
      setDateError("Return date must be after the pickup date.");
      return;
    }

    setDateError("");
    setChecking(true);
    try {
      const available = await getAvailableVans(pickupDate, returnDate);
      setFilteredVans(available);
      setAppliedRange({ pickup: pickupDate, ret: returnDate });
    } catch (err) {
      setDateError(err instanceof ApiRequestError ? err.message : "Couldn't check availability. Try again.");
    } finally {
      setChecking(false);
    }
  }

  function handleClear() {
    setPickupDate("");
    setReturnDate("");
    setDateError("");
    setFilteredVans(null);
    setAppliedRange(null);
  }

  const baseList = filteredVans ?? vans;
  const matchesType = (van: Van) => typeFilter === "all" || van.type === typeFilter;
  const shown = baseList?.filter(matchesType);
  const totalInCategory = vans?.filter(matchesType).length ?? 0;
  const resultsKey = `${appliedRange ? `${appliedRange.pickup}-${appliedRange.ret}` : "all"}-${typeFilter}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {typeTabs.map((tab) => {
          const isActive = typeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={cn(
                "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive ? "border-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="fleet-type-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleCheck}
        className="grid grid-cols-1 gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-pickup">Pickup date</Label>
          <Input
            id="filter-pickup"
            type="date"
            min={today()}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-return">Return date</Label>
          <Input
            id="filter-return"
            type="date"
            min={pickupDate || today()}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={checking} className="bg-brand text-brand-foreground hover:bg-brand/90">
          {checking ? <Loader2Icon className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
          {checking ? "Checking…" : "Check availability"}
        </Button>
        {filteredVans && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <XIcon className="size-4" />
            Clear
          </Button>
        )}
        {dateError && <p className="text-sm text-destructive sm:col-span-4">{dateError}</p>}
      </form>

      <AnimatePresence mode="wait">
        {appliedRange && !dateError && vans && (
          <motion.p
            key={resultsKey}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-muted-foreground"
          >
            {shown?.length ?? 0} of {totalInCategory} available for {appliedRange.pickup} – {appliedRange.ret}
          </motion.p>
        )}
      </AnimatePresence>

      {loadError && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <AlertCircleIcon className="size-6" />
          <p className="font-medium text-foreground">Couldn&apos;t load the fleet</p>
          <p className="max-w-sm text-sm">The API didn&apos;t respond. Make sure the backend is reachable.</p>
        </div>
      )}

      {!loadError && !vans && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
      )}

      {!loadError && vans && shown && shown.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground"
        >
          {filteredVans
            ? "No vehicles are free for those dates — try a different range."
            : "No vehicles in this category right now."}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {!loadError && shown && shown.length > 0 && (
          <RevealGroup key={resultsKey} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {shown.map((van) => (
              <RevealItem key={van.id}>
                <VanCard van={van} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </AnimatePresence>
    </div>
  );
}
