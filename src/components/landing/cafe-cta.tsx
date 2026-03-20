"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function CafeCta() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px 0px" })

  return (
    <section className="relative overflow-hidden bg-perch-dark py-24 sm:py-32">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-perch-primary-500/15"
        style={{ filter: "blur(120px)" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={ref}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center sm:px-6"
      >
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Your empty tables are leaving money{" "}
          <span className="bg-gradient-to-r from-perch-primary-400 to-perch-accent bg-clip-text text-transparent">
            on the table.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="max-w-xl text-lg leading-relaxed text-neutral-300"
        >
          Join 100+ cafes earning {"\u20B9"}15,000{"\u2013"}50,000/month from their off-peak hours.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className="flex items-center gap-12"
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-white">{"\u20B9"}0</span>
            <span className="text-xs text-neutral-400">to list</span>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden="true" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-white">10 min</span>
            <span className="text-xs text-neutral-400">to set up</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.44 }}
        >
          <Link
            href="/for-cafes"
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-7 py-3.5 text-sm font-semibold text-black",
              "transition-all hover:opacity-90 hover:shadow-xl hover:shadow-perch-primary-500/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-perch-dark"
            )}
          >
            List your cafe
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
