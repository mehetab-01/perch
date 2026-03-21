"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatPaise, formatDateLong, formatTime } from "@/lib/utils/format"

// ── Confetti dot config ──

const CONFETTI_COUNT = 60
const CONFETTI_COLORS = [
  "#F59E0B", // amber
  "#10B981", // emerald
  "#FB923C", // coral
  "#3B82F6", // blue
  "#A855F7", // purple
  "#EF4444", // red
  "#14B8A6", // teal
  "#F97316", // orange
]

// Seeded pseudo-random for React Compiler / hydration safety
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

type ConfettiDot = {
  x: number
  delay: number
  duration: number
  size: number
  color: string
  drift: number
}

const confettiDots: ConfettiDot[] = Array.from(
  { length: CONFETTI_COUNT },
  (_, i) => ({
    x: seededRandom(i) * 100,
    delay: seededRandom(i + 100) * 1.5,
    duration: 2 + seededRandom(i + 200) * 2,
    size: 4 + seededRandom(i + 300) * 8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
    drift: (seededRandom(i + 400) - 0.5) * 60,
  })
)

// ── Component ──

type PaymentSuccessProps = {
  bookingId: string
  cafeName?: string
  date?: string
  startTime?: string
  endTime?: string
  amountPaid?: number
}

function PaymentSuccess({
  bookingId,
  cafeName,
  date,
  startTime,
  endTime,
  amountPaid,
}: PaymentSuccessProps) {
  const router = useRouter()
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-redirect after 5 seconds
  useEffect(() => {
    redirectTimerRef.current = setTimeout(() => {
      router.push(`/bookings/${bookingId}`)
    }, 5000)

    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [bookingId, router])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiDots.map((dot, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${dot.x}vw`, opacity: 1, rotate: 0 }}
            animate={{
              y: "110vh",
              x: `calc(${dot.x}vw + ${dot.drift}px)`,
              opacity: [1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              ease: "linear",
            }}
            className="absolute rounded-full"
            style={{
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
            }}
          />
        ))}
      </div>

      {/* Success card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
        className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-stone-800 bg-stone-950 p-8 text-center shadow-2xl"
      >
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 200,
            delay: 0.4,
          }}
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <CheckCircle className="size-12 text-emerald-400" strokeWidth={1.5} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-2xl font-bold text-white"
        >
          Booking confirmed!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-sm text-stone-400"
        >
          Your space is reserved. Check your email for details.
        </motion.p>

        {/* Booking summary */}
        {(cafeName || date || amountPaid) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mx-auto mt-6 max-w-xs space-y-2 rounded-xl border border-stone-800 bg-stone-900/60 px-5 py-4 text-left text-sm"
          >
            {cafeName && (
              <div className="flex justify-between">
                <span className="text-stone-400">Cafe</span>
                <span className="font-medium text-stone-200">{cafeName}</span>
              </div>
            )}
            {date && (
              <div className="flex justify-between">
                <span className="text-stone-400">Date</span>
                <span className="font-medium text-stone-200">
                  {formatDateLong(date)}
                </span>
              </div>
            )}
            {startTime && endTime && (
              <div className="flex justify-between">
                <span className="text-stone-400">Time</span>
                <span className="font-medium text-stone-200">
                  {formatTime(startTime)} — {formatTime(endTime)}
                </span>
              </div>
            )}
            {amountPaid != null && (
              <div className="flex justify-between border-t border-stone-800 pt-2">
                <span className="text-stone-400">Paid</span>
                <span className="font-semibold text-emerald-400">
                  {formatPaise(amountPaid)}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            onClick={() => {
              if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
              router.push(`/bookings/${bookingId}`)
            }}
            className="flex-1"
          >
            View booking
            <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
              router.push("/search")
            }}
            className="flex-1"
          >
            <Search className="mr-1 size-4" />
            Back to search
          </Button>
        </motion.div>

        {/* Auto-redirect notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-xs text-stone-500"
        >
          Redirecting to your booking in a few seconds...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export { PaymentSuccess }
export type { PaymentSuccessProps }
