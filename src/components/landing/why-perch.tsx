"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ShieldCheck, Zap, Calendar, Lock } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const features = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Verified spaces",
    description: "Every cafe is verified. WiFi tested. Photos real.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "2-minute booking",
    description: "Search, pick, pay. Your space is confirmed instantly.",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Meeting tools built in",
    description: "Agenda, invites, calendar sync, QR check-in.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Secure payments",
    description: "Pay through Perch. Refund protection. GST invoices.",
  },
]

export function WhyPerch() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px 0px" })

  return (
    <section className="relative overflow-hidden bg-neutral-50 py-24 dark:bg-neutral-950 sm:py-32">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.06), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-perch-primary-500">
            Why Perch
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
            Built for better meetings
          </h2>
        </div>

        {/* Grid */}
        <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "flex gap-5 rounded-2xl border border-neutral-200 bg-white p-6",
                "dark:border-neutral-800 dark:bg-neutral-900"
              )}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-perch-primary-500/10 text-perch-primary-500"
                aria-hidden="true"
              >
                {feature.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
