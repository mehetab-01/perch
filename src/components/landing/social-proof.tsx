"use client"

import { motion } from "framer-motion"

const badges = [
  "500+ verified spaces",
  "10,000+ meetings booked",
  "4.8\u2605 average rating",
  "Trusted by 200+ companies",
]

// Duplicate for seamless loop
const items = [...badges, ...badges]

export function SocialProof() {
  return (
    <section className="overflow-hidden border-y border-neutral-800 bg-neutral-950 py-5">
      <div className="relative flex">
        <motion.div
          className="flex shrink-0 gap-12"
          initial={{ x: "0%" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {items.map((badge, i) => (
            <span
              key={`${badge}-${i}`}
              className="flex shrink-0 items-center gap-2 text-sm text-neutral-400"
            >
              <span className="h-1 w-1 rounded-full bg-perch-primary-600" aria-hidden="true" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
