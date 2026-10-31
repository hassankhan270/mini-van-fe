"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { cn } from "@/lib/utils";
import {
  ApiRequestError,
  checkAvailability,
  createReservation,
  getBookedDates,
  rentalDays,
  type DateRange,
  type Van,
} from "@/lib/api";

const steps = ["Dates", "Details", "Confirm"] as const;
type Step = 1 | 2 | 3;

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

export function BookingPanel({ van }: { van: Van }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateError, setDateError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bookedRanges, setBookedRanges] = useState<DateRange[] | null>(null);
  const [calendarError, setCalendarError] = useState(false);

  function goToStep(next: Step) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  useEffect(() => {
    let cancelled = false;
    getBookedDates(van.id)
      .then((ranges) => {
        if (!cancelled) setBookedRanges(ranges);
      })
      .catch(() => {
        if (!cancelled) setCalendarError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [van.id]);

  async function refreshBookedDates() {
    try {
      setBookedRanges(await getBookedDates(van.id));
    } catch {
      // keep the stale ranges rather than clearing the calendar
    }
  }

  const days = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    return rentalDays(pickupDate, returnDate);
  }, [pickupDate, returnDate]);

  const totalAmount = days > 0 ? days * van.pricePerDay : 0;

  async function handleDatesSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      setDateError("Choose a pickup and return date on the calendar.");
      return;
    }

    setDateError("");
    setCheckingAvailability(true);
    try {
      const { available } = await checkAvailability(van.id, pickupDate, returnDate);
      if (!available) {
        setDateError("Those dates are already booked for this van. Try a different range.");
        await refreshBookedDates();
        return;
      }
      goToStep(2);
    } catch (err) {
      setDateError(
        err instanceof ApiRequestError ? err.message : "Couldn't check availability. Try again.",
      );
    } finally {
      setCheckingAvailability(false);
    }
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setDetailsError("Fill in your name, email, and phone to continue.");
      return;
    }
    setDetailsError("");
    goToStep(3);
  }

  async function handleConfirm() {
    setConfirmError("");
    setSubmitting(true);
    try {
      const reservation = await createReservation({
        vanId: van.id,
        startDate: pickupDate,
        endDate: returnDate,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      });
      router.push(`/confirmation?id=${reservation.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        setDateError("Those dates were just taken by another booking. Pick new dates.");
        setReturnDate("");
        await refreshBookedDates();
        goToStep(1);
        return;
      }
      setConfirmError(
        err instanceof ApiRequestError ? err.message : "Couldn't complete the booking. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 text-card-foreground ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-semibold text-lg">Book this van</h2>

      <ol className="flex items-center gap-2 text-xs text-muted-foreground">
        {steps.map((label, i) => {
          const n = (i + 1) as Step;
          const isActive = n === step;
          const isDone = n < step;
          return (
            <li key={label} className="flex items-center gap-2">
              <motion.span
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[11px] font-medium transition-colors duration-300",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isDone && "border-success bg-success text-success-foreground",
                  !isActive && !isDone && "border-border text-muted-foreground",
                )}
              >
                {isDone ? <CheckIcon className="size-3.5" /> : n}
              </motion.span>
              <span className={cn("transition-colors duration-300", isActive ? "text-foreground" : undefined)}>
                {label}
              </span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
            </li>
          );
        })}
      </ol>

      <Separator />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 1 && (
              <form onSubmit={handleDatesSubmit} className="flex flex-col gap-4">
                {bookedRanges === null && !calendarError && <Skeleton className="h-64 rounded-lg" />}
                {calendarError && (
                  <p className="text-sm text-muted-foreground">
                    Couldn&apos;t load the booking calendar — you can still pick dates and we&apos;ll check
                    availability.
                  </p>
                )}
                {bookedRanges !== null && (
                  <AvailabilityCalendar
                    bookedRanges={bookedRanges}
                    startDate={pickupDate}
                    endDate={returnDate}
                    onChange={({ startDate, endDate }) => {
                      setPickupDate(startDate);
                      setReturnDate(endDate);
                      setDateError("");
                    }}
                  />
                )}
                <div className="flex gap-3 text-sm">
                  <div className="flex-1 rounded-lg border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="font-medium">{pickupDate || "Select a date"}</p>
                  </div>
                  <div className="flex-1 rounded-lg border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Return</p>
                    <p className="font-medium">{returnDate || "Select a date"}</p>
                  </div>
                </div>
                {dateError && <p className="text-sm text-destructive">{dateError}</p>}
                <Button
                  type="submit"
                  disabled={checkingAvailability}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {checkingAvailability && <Loader2Icon className="size-4 animate-spin" />}
                  {checkingAvailability ? "Checking availability…" : "Continue"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@email.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 010 1234"
                  />
                </div>
                {detailsError && <p className="text-sm text-destructive">{detailsError}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => goToStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pickup date</dt>
                    <dd className="font-medium">{pickupDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Return date</dt>
                    <dd className="font-medium">{returnDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rental days</dt>
                    <dd className="font-medium">{days} days</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Daily price</dt>
                    <dd className="font-mono font-medium">${van.pricePerDay}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <dt className="font-semibold">Total amount</dt>
                    <dd className="font-mono font-semibold">${totalAmount}</dd>
                  </div>
                </dl>
                {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => goToStep(2)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                    onClick={handleConfirm}
                  >
                    {submitting && <Loader2Icon className="size-4 animate-spin" />}
                    {submitting ? "Booking…" : "Confirm booking"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
