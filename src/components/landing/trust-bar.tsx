"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ShieldCheck, Lock, Zap } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface TrustItem {
  icon: React.ReactNode
  label: string
  description: string
}

const trustItems: TrustItem[] = [
  {
    icon: <ShieldCheck className="h-6 w-6" aria-hidden="true" />,
    label: "Verified Cafes",
    description: "Every space is inspected and approved before it goes live on Perch.",
  },
  {
    icon: <Lock className="h-6 w-6" aria-hidden="true" />,
    label: "Secure Payments",
    description: "Razorpay-powered checkout with buyer protection on every booking.",
  },
  {
    icon: <Zap className="h-6 w-6" aria-hidden="true" />,
    label: "Instant Booking",
    description: "Confirmed in seconds, no back-and-forth with the cafe owner.",
  },
]

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })

  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-900/50 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div
          ref={ref}
          className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4"
          role="list"
          aria-label="Trust signals"
        >
          {trustItems.map((item, i) => (
            <motion.div
              key={item.label}
              role="listitem"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={cn(
                "flex flex-col items-center gap-3 text-center sm:items-start sm:text-left",
                "border-b border-neutral-200 pb-8 last:border-0 last:pb-0",
                "dark:border-neutral-800",
                "sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8 sm:last:border-r-0"
              )}
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                {item.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold tracking-tight text-neutral-950 dark:text-white">
                  {item.label}
                </span>
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
