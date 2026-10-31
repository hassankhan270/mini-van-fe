"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VanImage } from "@/components/van-image";
import type { Reservation } from "@/lib/api";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export function ConfirmationCard({
  reservation,
  days,
  total,
  reference,
}: {
  reservation: Reservation;
  days: number;
  total: number;
  reference: string;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl bg-card p-8 text-center text-card-foreground ring-1 ring-foreground/10"
    >
      <motion.span
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <CheckIcon className="size-7" />
      </motion.span>

      <motion.div variants={item}>
        <h1 className="text-xl font-semibold">Booking confirmed!</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your reservation has been successfully created.</p>
      </motion.div>

      <motion.div variants={item} className="w-full rounded-xl bg-secondary/60 px-4 py-3">
        <p className="text-xs text-muted-foreground">Booking reference</p>
        <p className="font-mono text-lg font-semibold tracking-wide">{reference}</p>
      </motion.div>

      <motion.div variants={item} className="flex w-full items-center gap-3 text-left">
        <VanImage src={reservation.van.imageUrl} alt={reservation.van.name} className="size-14 shrink-0 rounded-lg" />
        <div>
          <p className="font-medium">{reservation.van.name}</p>
          <p className="text-sm text-muted-foreground">For {reservation.customerName}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="w-full">
        <Separator />
      </motion.div>

      <motion.dl variants={item} className="grid w-full grid-cols-2 gap-x-4 gap-y-3 text-left text-sm">
        <div>
          <dt className="text-muted-foreground">Pickup</dt>
          <dd className="font-medium">{reservation.startDate}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Return</dt>
          <dd className="font-medium">{reservation.endDate}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Rental days</dt>
          <dd className="font-medium">{days} days</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="font-mono font-medium">${total}</dd>
        </div>
      </motion.dl>

      <motion.div variants={item} className="flex w-full flex-col gap-2">
        <Button
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          render={<Link href={`/reservations/${reservation.id}`}>Manage this booking</Link>}
        />
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" render={<Link href="/fleet">Browse more</Link>} />
          <Button variant="outline" className="flex-1" render={<Link href="/">Back home</Link>} />
        </div>
      </motion.div>
    </motion.div>
  );
}
