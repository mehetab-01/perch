"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Search,
  Zap,
  MapPin,
  ListPlus,
  BadgeCheck,
  CalendarDays,
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
    title: "Search & filter spaces",
    description:
      "Browse cafe spaces by location, capacity, and amenities. Filter by WiFi, projectors, whiteboards and more.",
  },
  {
    number: "02",
    icon: <Zap className="h-5 w-5" aria-hidden="true" />,
    title: "Book in 2 minutes",
    description:
      "Select your slot, pay securely via Razorpay, and get an instant confirmation — no waiting, no phone calls.",
  },
  {
    number: "03",
    icon: <MapPin className="h-5 w-5" aria-hidden="true" />,
    title: "Show up & meet",
    description:
      "Arrive, present your booking QR, and get straight to business in a great-smelling, fully-equipped space.",
  },
]

const cafeSteps: Step[] = [
  {
    number: "01",
    icon: <ListPlus className="h-5 w-5" aria-hidden="true" />,
    title: "List your space",
    description:
      "Add photos, set your availability and hourly rate. Your first listing is completely free to publish.",
  },
  {
    number: "02",
    icon: <BadgeCheck className="h-5 w-5" aria-hidden="true" />,
    title: "Get verified",
    description:
      "Our team does a quick review to ensure quality and safety standards. Most listings go live within 24 hours.",
  },
  {
    number: "03",
    icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
    title: "Earn on your schedule",
    description:
      "Bookings land in your dashboard. Payments settle automatically after each session — no chasing invoices.",
  },
]

interface StepCardProps {
  step: Step
  index: number
  accent: string
}

function StepCard({ step, index, accent }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.12 }}
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6",
        "dark:border-neutral-800 dark:bg-neutral-900"
      )}
    >
      {/* Step number */}
      <span className={cn("text-xs font-bold tracking-widest", accent)}>
        {step.number}
      </span>

      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accent === "text-amber-500"
            ? "bg-amber-500/10 text-amber-500"
            : "bg-orange-500/10 text-orange-500"
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

interface ColumnProps {
  label: string
  badge: string
  badgeBg: string
  steps: Step[]
  accent: string
}

function Column({ label, badge, badgeBg, steps, accent }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px 0px" })

  return (
    <div ref={ref} className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            badgeBg
          )}
        >
          {badge}
        </span>
        <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
          {label}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {inView &&
          steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} accent={accent} />
          ))}
        {!inView &&
          steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                "h-[168px] rounded-2xl border border-neutral-200 bg-white opacity-0",
                "dark:border-neutral-800 dark:bg-neutral-900"
              )}
              aria-hidden="true"
            />
          ))}
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="bg-neutral-50 py-24 dark:bg-neutral-950 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
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
          <Column
            label="For Professionals"
            badge="Professionals"
            badgeBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            steps={workerSteps}
            accent="text-amber-500"
          />
          <Column
            label="For Cafe Owners"
            badge="Cafe Owners"
            badgeBg="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            steps={cafeSteps}
            accent="text-orange-500"
          />
        </div>
      </div>
    </section>
  )
}
