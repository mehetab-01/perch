"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Search,
  MousePointerClick,
  MapPin,
  ListPlus,
  CalendarCheck,
  IndianRupee,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface Step {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}

const workerSteps: Step[] = [
  {
    number: "01",
    icon: <Search className="h-5 w-5" aria-hidden="true" />,
    title: "Search for a space",
    description:
      "Browse by location, date, capacity, and amenities. Filter for WiFi, projectors, whiteboards, and more.",
  },
  {
    number: "02",
    icon: <MousePointerClick className="h-5 w-5" aria-hidden="true" />,
    title: "Book in 2 taps",
    description:
      "Pick your slot, pay securely via Razorpay. Instant confirmation — no calls, no waiting.",
  },
  {
    number: "03",
    icon: <MapPin className="h-5 w-5" aria-hidden="true" />,
    title: "Show up and meet",
    description:
      "Present your booking QR code, settle in, and get straight to business in a cafe you love.",
  },
]

const cafeSteps: Step[] = [
  {
    number: "01",
    icon: <ListPlus className="h-5 w-5" aria-hidden="true" />,
    title: "List your space for free",
    description:
      "Add photos, set availability and hourly rates. Your first listing is completely free to publish.",
  },
  {
    number: "02",
    icon: <CalendarCheck className="h-5 w-5" aria-hidden="true" />,
    title: "Get bookings automatically",
    description:
      "Professionals discover and book your space. No marketing, no outreach — bookings come to you.",
  },
  {
    number: "03",
    icon: <IndianRupee className="h-5 w-5" aria-hidden="true" />,
    title: "Earn \u20B915,000\u201350,000/month",
    description:
      "Payments settle automatically after each session. Turn off-peak empty tables into steady revenue.",
  },
]

function StepCard({ step, index, accent }: { step: Step; index: number; accent: "amber" | "green" }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6",
        "dark:border-neutral-800 dark:bg-neutral-900"
      )}
    >
      {/* Step number */}
      <span
        className={cn(
          "text-xs font-bold tracking-widest",
          accent === "amber" ? "text-perch-primary-500" : "text-perch-secondary-500"
        )}
      >
        {step.number}
      </span>

      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accent === "amber"
            ? "bg-perch-primary-500/10 text-perch-primary-500"
            : "bg-perch-secondary-500/10 text-perch-secondary-500"
        )}
        aria-hidden="true"
      >
        {step.icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h4 className="text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
          {step.title}
        </h4>
        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {step.description}
        </p>
      </div>
    </motion.div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-neutral-50 py-24 dark:bg-neutral-950 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-perch-primary-500">
            How it works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
            Simple for everyone
          </h2>
          <p className="max-w-md text-base text-neutral-500 dark:text-neutral-400">
            Whether you need a space to meet or a stream of reliable bookings, Perch is built for you.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
          {/* For Professionals */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-perch-primary-500/10 px-3 py-1 text-xs font-semibold text-perch-primary-600 dark:text-perch-primary-400">
                Professionals
              </span>
              <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                For Professionals
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {workerSteps.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} accent="amber" />
              ))}
            </div>
          </div>

          {/* For Cafe Owners */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-perch-secondary-500/10 px-3 py-1 text-xs font-semibold text-perch-secondary-600 dark:text-perch-secondary-400">
                Cafe Owners
              </span>
              <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                For Cafe Owners
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {cafeSteps.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} accent="green" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
