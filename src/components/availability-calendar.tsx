"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toLocalISODate, type DateRange } from "@/lib/api";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function isWithinBookedRange(day: string, ranges: DateRange[]) {
  return ranges.some((r) => day >= r.startDate && day < r.endDate);
}

function hasConflictBetween(start: string, end: string, ranges: DateRange[]) {
  return ranges.some((r) => start < r.endDate && end > r.startDate);
}

export function AvailabilityCalendar({
  bookedRanges,
  startDate,
  endDate,
  onChange,
  conflictMessage,
}: {
  bookedRanges: DateRange[];
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
  conflictMessage?: string;
}) {
  const today = useMemo(() => toLocalISODate(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date(`${today}T00:00:00`);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const weeks = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    const days: { iso: string; label: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push({ iso: toLocalISODate(d), label: d.getDate(), inMonth: d.getMonth() === month });
    }

    const result: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [viewMonth]);

  function handlePick(iso: string) {
    const isPast = iso < today;
    const isBooked = isWithinBookedRange(iso, bookedRanges);
    if (isPast || isBooked) return;

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: iso, endDate: "" });
      return;
    }
    if (iso <= startDate) {
      onChange({ startDate: iso, endDate: "" });
      return;
    }
    if (hasConflictBetween(startDate, iso, bookedRanges)) {
      onChange({ startDate: iso, endDate: "" });
      return;
    }
    onChange({ startDate, endDate: iso });
  }

  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <p className="text-sm font-medium">{monthLabel}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((d, i) => (
          <span key={i} className="text-[11px] font-medium text-muted-foreground">
            {d}
          </span>
        ))}
        {weeks.map((week) =>
          week.map(({ iso, label, inMonth }) => {
            const isPast = iso < today;
            const isBooked = isWithinBookedRange(iso, bookedRanges);
            const isStart = iso === startDate;
            const isEnd = iso === endDate;
            const isInRange = startDate && endDate && iso > startDate && iso < endDate;
            const disabled = isPast || isBooked || !inMonth;

            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => handlePick(iso)}
                className={cn(
                  "relative flex h-9 items-center justify-center text-sm transition-colors",
                  !inMonth && "invisible",
                  inMonth && !disabled && "text-foreground hover:bg-muted rounded-md",
                  inMonth && isPast && "text-muted-foreground/30",
                  inMonth && isBooked && !isPast && "text-muted-foreground/40 line-through",
                  isInRange && "bg-brand/15 text-foreground",
                  (isStart || isEnd) && "rounded-md bg-brand font-semibold text-brand-foreground hover:bg-brand",
                )}
              >
                {label}
              </button>
            );
          }),
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted-foreground/30" /> Already booked
        </span>
      </div>

      {conflictMessage && <p className="text-sm text-destructive">{conflictMessage}</p>}
    </div>
  );
}
