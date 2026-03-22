"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Calendar, Users, Search, ChevronDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { AISearchBar } from "@/components/search/ai-search-bar"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

function Hero() {
  const router = useRouter()
  const [aiMode, setAiMode] = useState(false)

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

        {/* Search bar */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.7, delay: 0.45 }}
          className="w-full max-w-3xl"
        >
          <AnimatePresence mode="wait">
            {aiMode ? (
              <motion.div
                key="ai-search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AISearchBar onClose={() => setAiMode(false)} variant="hero" />
              </motion.div>
            ) : (
              <motion.div
                key="manual-search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form
                  role="search"
                  aria-label="Search for cafe spaces"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const location = (form.elements.namedItem("location") as HTMLInputElement).value.trim()
                    const date = (form.elements.namedItem("date") as HTMLInputElement).value
                    const people = (form.elements.namedItem("people") as HTMLInputElement).value
                    const params = new URLSearchParams()
                    if (location) params.set("city", location)
                    if (date) params.set("date", date)
                    if (people) params.set("people", people)
                    router.push(`/search${params.size ? `?${params}` : ""}`)
                  }}
                  className={cn(
                    "flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl",
                    "sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2"
                  )}
                >
                  {/* Location */}
                  <div
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-xl px-4 py-3",
                      "sm:rounded-full sm:transition-colors sm:hover:bg-white/5"
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-perch-primary-400" aria-hidden="true" />
                    <input
                      name="location"
                      type="text"
                      placeholder="Mumbai, Bandra..."
                      aria-label="Search location"
                      className="min-w-0 w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
                    />
                  </div>

                  {/* Divider */}
                  <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />

                  {/* Date */}
                  <div
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-xl px-4 py-3",
                      "sm:rounded-full sm:transition-colors sm:hover:bg-white/5"
                    )}
                  >
                    <Calendar className="h-4 w-4 shrink-0 text-perch-primary-400" aria-hidden="true" />
                    <input
                      name="date"
                      type="date"
                      aria-label="Select date"
                      className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none [color-scheme:dark]"
                    />
                  </div>

                  {/* Divider */}
                  <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />

                  {/* People */}
                  <div
                    className={cn(
                      "flex flex-1 items-center gap-2 rounded-xl px-4 py-3",
                      "sm:rounded-full sm:transition-colors sm:hover:bg-white/5"
                    )}
                  >
                    <Users className="h-4 w-4 shrink-0 text-perch-primary-400" aria-hidden="true" />
                    <input
                      name="people"
                      type="number"
                      min={1}
                      max={20}
                      placeholder="People (1-20)"
                      aria-label="Number of people"
                      className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Search button */}
                  <button
                    type="submit"
                    aria-label="Find spaces"
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-6 py-3 text-sm font-semibold text-black",
                      "transition-all hover:opacity-90 hover:shadow-lg hover:shadow-perch-primary-500/25",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                      "sm:rounded-full"
                    )}
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Find spaces
                  </button>
                </form>

                {/* AI Search toggle */}
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setAiMode(true)}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-perch-primary-400 backdrop-blur-sm transition-all hover:border-perch-primary-400/30 hover:bg-white/10"
                  >
                    <Sparkles className="size-3.5" />
                    Try AI Search
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
