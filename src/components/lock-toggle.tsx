"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LockIcon, LockOpenIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiRequestError, toggleLock, type Reservation } from "@/lib/api";

export function LockToggle({ reservation }: { reservation: Reservation }) {
  const [isLocked, setIsLocked] = useState(reservation.isLocked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleToggle() {
    setLoading(true);
    setError("");
    try {
      const updated = await toggleLock(reservation.id);
      setIsLocked(updated.isLocked);
    } catch (err) {
      // Toggle didn't go through (e.g. outside the rental window) — leave the state as-is.
      setError(
        err instanceof ApiRequestError && err.status === 403
          ? "This booking is outside its rental window, so it stays unlocked for now."
          : err instanceof ApiRequestError
            ? err.message
            : "Couldn't update the lock. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        variant={isLocked ? undefined : "outline"}
        className={isLocked ? "w-full bg-success text-success-foreground hover:bg-success/90" : "w-full"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={loading ? "loading" : isLocked ? "locked" : "unlocked"}
            initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : isLocked ? (
              <LockIcon className="size-4" />
            ) : (
              <LockOpenIcon className="size-4" />
            )}
          </motion.span>
        </AnimatePresence>
        {isLocked ? "Locked — tap to unlock" : "Unlocked — tap to lock"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
