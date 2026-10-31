"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function HeroCopy() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
      <motion.p variants={item} className="text-sm font-medium tracking-wide text-brand">
        Van rentals, done simply
      </motion.p>
      <motion.h1 variants={item} className="mt-3 text-4xl font-semibold leading-[1.1] text-balance sm:text-5xl">
        Your journey. Your van. Your freedom.
      </motion.h1>
      <motion.p variants={item} className="mt-4 max-w-md text-primary-foreground/75">
        Premium rental vans for road trips, moves, and group travel — browse the fleet and book in
        minutes.
      </motion.p>
      <motion.div variants={item}>
        <Button
          render={<Link href="/fleet">Browse the fleet</Link>}
          size="lg"
          className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90"
        />
      </motion.div>
    </motion.div>
  );
}
