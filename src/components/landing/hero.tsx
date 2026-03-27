"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16">
      {/* Animated gradient background */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.15), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(251,191,36,0.10), transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,251,235,0.05), transparent 70%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 50%", "0% 100%", "0% 0%"],
        }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      />

      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-[-10%] h-[500px] w-[500px] rounded-full bg-perch-primary-500"
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
          className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-perch-accent"
          style={{ filter: "blur(90px)", opacity: 0.14 }}
          animate={{
            scale: [1, 0.9, 1.3, 1.05, 1],
            x: [0, -50, 20, -30, 0],
            y: [0, 40, -30, 20, 0],
          }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[30%] h-[350px] w-[350px] rounded-full bg-perch-primary-300"
          style={{ filter: "blur(100px)", opacity: 0.10 }}
          animate={{
            scale: [1, 1.25, 0.85, 1.1, 1],
            x: [0, 60, -40, 20, 0],
            y: [0, -40, 30, -20, 0],
          }}
          transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-4xl text-5xl font-bold tracking-tight text-white font-display sm:text-6xl md:text-7xl"
        >
          Find your{" "}
          <span className="bg-gradient-to-r from-perch-primary-400 via-perch-accent to-perch-primary-500 bg-clip-text text-transparent">
            perch.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-xl text-lg leading-relaxed text-neutral-300 sm:text-xl"
        >
          Book meeting-ready cafe spaces in 2 minutes.
          <br className="hidden sm:block" />
          No calls. No walk-ins. No WeWork prices.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          <Link
            href="/sign-up"
            id="hero-get-started"
            className={cn(
              "group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-8 py-3.5 text-base font-semibold text-black",
              "transition-all duration-300 hover:shadow-xl hover:shadow-perch-primary-500/30 hover:scale-[1.03]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <Link
            href="/sign-in"
            id="hero-login"
            className={cn(
              "flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm",
              "transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-[1.03]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
          >
            Login
          </Link>
        </motion.div>

        {/* Social proof micro-text */}
        <motion.p
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-xs text-neutral-500"
        >
          Trusted by{" "}
          <span className="text-neutral-300">1,200+ professionals</span> across
          3 cities
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        <ChevronDown className="h-6 w-6 text-neutral-600" aria-hidden="true" />
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
    </section>
  )
}

export { Hero }

