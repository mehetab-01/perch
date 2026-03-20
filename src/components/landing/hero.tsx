"use client"

import { motion } from "framer-motion"
import { MapPin, Calendar, Users, Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "#0a0a0a" }}
    >
      {/* Animated mesh gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500"
          style={{ filter: "blur(80px)", opacity: 0.18 }}
          animate={{
            scale: [1, 1.2, 0.95, 1.15, 1],
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "40% 60% 70% 30% / 40% 70% 30% 60%",
              "60% 40% 50% 50% / 30% 60% 40% 70%",
              "50% 50% 40% 60% / 60% 40% 70% 30%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
            ],
            x: [0, 40, -20, 30, 0],
            y: [0, 30, 60, -20, 0],
          }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-orange-400"
          style={{ filter: "blur(90px)", opacity: 0.14 }}
          animate={{
            scale: [1, 0.9, 1.3, 1.05, 1],
            borderRadius: [
              "40% 60% 60% 40% / 60% 40% 60% 40%",
              "60% 40% 40% 60% / 40% 60% 40% 60%",
              "50% 50% 60% 40% / 50% 50% 40% 60%",
              "40% 60% 50% 50% / 60% 40% 60% 40%",
              "40% 60% 60% 40% / 60% 40% 60% 40%",
            ],
            x: [0, -50, 20, -30, 0],
            y: [0, 40, -30, 20, 0],
          }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[30%] h-[350px] w-[350px] rounded-full bg-yellow-300"
          style={{ filter: "blur(100px)", opacity: 0.10 }}
          animate={{
            scale: [1, 1.25, 0.85, 1.1, 1],
            borderRadius: [
              "50% 50% 40% 60% / 40% 60% 50% 50%",
              "60% 40% 50% 50% / 60% 40% 60% 40%",
              "40% 60% 60% 40% / 40% 60% 40% 60%",
              "50% 50% 50% 50% / 50% 50% 50% 50%",
              "50% 50% 40% 60% / 40% 60% 50% 50%",
            ],
            x: [0, 60, -40, 20, 0],
            y: [0, -40, 30, -20, 0],
          }}
          transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute left-[50%] top-[5%] h-[300px] w-[300px] rounded-full bg-amber-400"
          style={{ filter: "blur(70px)", opacity: 0.12 }}
          animate={{
            scale: [1, 1.1, 1.3, 0.9, 1],
            x: [0, -30, 40, -10, 0],
            y: [0, 50, -20, 30, 0],
          }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-amber-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Now available in Mumbai, Bengaluru &amp; Delhi
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Find your{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">
            perch.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.35 }}
          className="max-w-xl text-lg leading-relaxed text-neutral-400 sm:text-xl"
        >
          Book meeting-ready cafe spaces in 2 minutes. No hassle, no back-and-forth — just show up and meet.
        </motion.p>

        {/* Search bar */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full max-w-3xl"
        >
          <div className={cn(
            "flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm",
            "sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2"
          )}>
            {/* Location */}
            <div className={cn(
              "flex flex-1 items-center gap-2 rounded-xl px-4 py-3",
              "sm:rounded-full sm:hover:bg-white/5 sm:transition-colors"
            )}>
              <MapPin className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="City or neighbourhood"
                aria-label="Search location"
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
              />
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />

            {/* Date */}
            <div className={cn(
              "flex flex-1 items-center gap-2 rounded-xl px-4 py-3",
              "sm:rounded-full sm:hover:bg-white/5 sm:transition-colors"
            )}>
              <Calendar className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="When?"
                aria-label="Select date"
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
              />
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />

            {/* People */}
            <div className={cn(
              "flex flex-1 items-center gap-2 rounded-xl px-4 py-3",
              "sm:rounded-full sm:hover:bg-white/5 sm:transition-colors"
            )}>
              <Users className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <input
                type="number"
                min={1}
                placeholder="How many?"
                aria-label="Number of people"
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            {/* Search button */}
            <button
              type="button"
              aria-label="Search spaces"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-semibold text-black",
                "transition-all hover:opacity-90 hover:shadow-lg hover:shadow-orange-500/25",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                "sm:rounded-full sm:px-6 sm:py-3"
              )}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-xs text-neutral-600"
        >
          Trusted by <span className="text-neutral-400">1,200+ professionals</span> across 3 cities
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
    </section>
  )
}
