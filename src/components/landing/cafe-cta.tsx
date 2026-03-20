"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function CafeCta() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px 0px" })

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: "#0a0a0a" }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20"
        style={{ filter: "blur(120px)" }}
        aria-hidden="true"
      />

      {/* Floating decorative shapes */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[15%] h-24 w-24 rounded-2xl border border-amber-500/20 bg-amber-500/5"
        animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[10%] top-[20%] h-16 w-16 rounded-full border border-orange-500/20 bg-orange-500/5"
        animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[15%] left-[15%] h-12 w-12 rounded-xl border border-yellow-400/20 bg-yellow-400/5"
        animate={{ y: [0, 10, 0], x: [0, 8, 0] }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[20%] right-[8%] h-20 w-20 rounded-3xl border border-amber-400/15 bg-amber-400/5"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Content */}
      <div
        ref={ref}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center"
      >
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-amber-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
          For cafe owners
        </motion.span>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          Turn your empty tables{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            into revenue.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="max-w-xl text-lg leading-relaxed text-neutral-400"
        >
          Join 200+ cafes already earning with Perch. List your first space free — no commission until your second booking.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { value: "₹18K", label: "avg. monthly earnings" },
            { value: "200+", label: "cafes listed" },
            { value: "24hr", label: "avg. approval time" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-neutral-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.52 }}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3.5 text-sm font-semibold text-black",
              "transition-all hover:opacity-90 hover:shadow-xl hover:shadow-orange-500/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
          >
            List your cafe
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white",
              "transition-all hover:border-white/30 hover:bg-white/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
          >
            <Play className="h-4 w-4 fill-white" aria-hidden="true" />
            See how it works
          </button>
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-xs text-neutral-600"
        >
          No credit card required. First listing is always free.
        </motion.p>
      </div>
    </section>
  )
}
