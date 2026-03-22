"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  ArrowRight,
  Store,
  Camera,
  CalendarCheck,
  IndianRupee,
  Wifi,
  Shield,
  Users,
  BarChart3,
  ChevronDown,
  Clock,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Container } from "@/components/ui/container"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function ForCafesHero() {
  return (
    <section className="relative overflow-hidden bg-perch-dark pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-perch-primary-500/10"
        style={{ filter: "blur(140px)" }}
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-perch-primary-500/20 bg-perch-primary-500/10 px-4 py-1.5 text-xs font-medium text-perch-primary-400"
        >
          <Zap className="size-3.5" />
          Free to list — no upfront costs
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          Your empty tables are leaving{" "}
          <span className="bg-gradient-to-r from-perch-primary-400 to-perch-accent bg-clip-text text-transparent">
            money on the table.
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300"
        >
          Turn your off-peak hours into a revenue stream. Professionals are
          looking for quiet, Wi-Fi-ready spaces for their meetings — and your
          cafe is exactly what they need.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12"
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-white">
              {"\u20B9"}15K–50K
            </span>
            <span className="text-xs text-neutral-400">per month avg.</span>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden="true" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-white">10 min</span>
            <span className="text-xs text-neutral-400">to set up</span>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden="true" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-white">
              {"\u20B9"}0
            </span>
            <span className="text-xs text-neutral-400">listing fee</span>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10"
        >
          <Link
            href="/onboarding"
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-8 py-4 text-sm font-semibold text-black",
              "transition-all hover:opacity-90 hover:shadow-xl hover:shadow-perch-primary-500/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-perch-dark"
            )}
          >
            List your cafe
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </Container>
    </section>
  )
}

// ─── How it works ───────────────────────────────────────────────────────────

const steps = [
  {
    icon: Store,
    title: "Create your profile",
    description:
      "Add your cafe details, address, and upload photos. Takes under 10 minutes.",
  },
  {
    icon: Camera,
    title: "List your spaces",
    description:
      "Define your meeting-ready spaces — private rooms, quiet corners, or full-cafe bookings with pricing.",
  },
  {
    icon: Shield,
    title: "Get verified",
    description:
      "Our team reviews your listing for quality. Once approved, you go live instantly.",
  },
  {
    icon: CalendarCheck,
    title: "Start earning",
    description:
      "Professionals book your spaces. You get paid directly — we handle the rest.",
  },
]

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-perch-dark py-20 sm:py-28">
      <Container ref={ref}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-neutral-400">
            Four simple steps to start earning from your cafe spaces.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="relative rounded-xl border border-white/5 bg-white/[0.02] p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-perch-primary-500/10">
                <step.icon className="size-5 text-perch-primary-400" />
              </div>
              <span className="absolute right-4 top-4 text-3xl font-bold text-white/5">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── Why Perch ──────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: IndianRupee,
    title: "Zero listing fees",
    description:
      "We only earn when you earn. A small platform fee is deducted from each booking — nothing upfront.",
  },
  {
    icon: Clock,
    title: "Monetize off-peak hours",
    description:
      "Your slowest hours become your most profitable. Mornings, weekday afternoons — professionals love them.",
  },
  {
    icon: Users,
    title: "High-quality guests",
    description:
      "Only verified professionals book through Perch. No random walk-ins — just respectful, business-focused customers.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & analytics",
    description:
      "Track your bookings, earnings, reviews, and occupancy in a dedicated cafe dashboard.",
  },
  {
    icon: Shield,
    title: "Secure payments",
    description:
      "All payments are processed through Razorpay. Funds are settled directly to your account.",
  },
  {
    icon: Wifi,
    title: "You set the rules",
    description:
      "Set your own prices, availability, and cancellation policy. Block out times, deactivate spaces anytime.",
  },
]

function WhyPerchSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="border-t border-white/5 bg-perch-dark py-20 sm:py-28">
      <Container ref={ref}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why cafes choose Perch
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-perch-primary-500/10">
                <b.icon className="size-4.5 text-perch-primary-400" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">
                {b.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                {b.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── Testimonials ───────────────────────────────────────────────────────────

const testimonials = [
  {
    quote:
      "We used to make nothing on weekday mornings. Now we earn ₹25,000+ a month from those same hours.",
    name: "Priya Sharma",
    role: "Owner, The Grind Cafe",
    city: "Mumbai",
  },
  {
    quote:
      "Setup was ridiculously easy. We listed our private room and got our first booking within 48 hours.",
    name: "Arjun Mehta",
    role: "Manager, Brew & Beyond",
    city: "Bengaluru",
  },
  {
    quote:
      "The professionals who book are great customers. They order coffee, they're quiet, and they leave on time.",
    name: "Neha Kapoor",
    role: "Co-founder, Cafe Nook",
    city: "Delhi",
  },
]

function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="border-t border-white/5 bg-perch-dark py-20 sm:py-28">
      <Container ref={ref}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Cafe owners love Perch
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
            >
              <p className="text-sm leading-relaxed text-neutral-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4 border-t border-white/5 pt-4">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-neutral-500">
                  {t.role} — {t.city}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── FAQ ────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "How much does it cost to list my cafe?",
    a: "Nothing. Listing is completely free. We charge a small platform fee (deducted automatically) only when you get a paid booking.",
  },
  {
    q: "What kind of spaces can I list?",
    a: "Any space that works for a professional meeting — private rooms, quiet corners, outdoor patios, or even your full cafe during off-peak hours. You define what's available.",
  },
  {
    q: "How do I get paid?",
    a: "Payments are processed via Razorpay and settled directly to your linked bank account. You'll see earnings in your dashboard in real-time.",
  },
  {
    q: "Can I control when my space is available?",
    a: "Absolutely. You set your own availability, pricing, and cancellation policy. You can block out specific times or deactivate a space anytime.",
  },
  {
    q: "What if a guest damages something or causes a problem?",
    a: "All guests are verified users with linked identities. We have a review and rating system, and our team handles dispute resolution.",
  },
  {
    q: "How long does verification take?",
    a: "Usually under 24 hours. We verify your GST/FSSAI documents and check your listing for quality before approving.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-medium text-white">{q}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-relaxed text-neutral-400">{a}</p>
      </motion.div>
    </div>
  )
}

function FaqSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="border-t border-white/5 bg-perch-dark py-20 sm:py-28">
      <Container ref={ref}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 max-w-2xl">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── Final CTA ──────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="border-t border-white/5 bg-perch-dark py-20 sm:py-28">
      <Container className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to start earning?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-neutral-400">
          Join cafes across India turning dead hours into steady income. Setup
          takes 10 minutes and listing is free.
        </p>
        <div className="mt-8">
          <Link
            href="/onboarding"
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-8 py-4 text-sm font-semibold text-black",
              "transition-all hover:opacity-90 hover:shadow-xl hover:shadow-perch-primary-500/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-perch-dark"
            )}
          >
            List your cafe — it&apos;s free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>
    </section>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

function ForCafesPage() {
  return (
    <main>
      <ForCafesHero />
      <HowItWorks />
      <WhyPerchSection />
      <Testimonials />
      <FaqSection />
      <FinalCta />
    </main>
  )
}

export { ForCafesPage as default }
