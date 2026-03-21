"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Users, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { Space } from "@/lib/db/schema"

const PLATFORM_FEE_RATE = 0.05
const GST_RATE = 0.18

type BookingWidgetProps = {
  spaces: Space[]
  selectedSpaceId: string | null
  onSelectSpace: (spaceId: string) => void
  isSignedIn: boolean
}

function BookingWidget({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  isSignedIn,
}: BookingWidgetProps) {
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("10:00")
  const [duration, setDuration] = useState(1)
  const [people, setPeople] = useState(2)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeSpaces = spaces.filter((s) => s.isActive)
  const selectedSpace = activeSpaces.find((s) => s.id === selectedSpaceId)

  // Price calculation (all in paise)
  const pricing = (() => {
    if (!selectedSpace) return null
    const base = selectedSpace.pricePerHour * duration
    const platformFee = Math.round(base * PLATFORM_FEE_RATE)
    const subtotal = base + platformFee
    const gst = Math.round(subtotal * GST_RATE)
    const total = subtotal + gst
    return { base, platformFee, gst, total }
  })()

  const handleBook = () => {
    if (!isSignedIn) {
      window.location.href = "/sign-in"
      return
    }
    if (!selectedSpace || !date) return
    // Razorpay integration will go here
    alert(
      `Booking confirmed!\n\nSpace: ${selectedSpace.name}\nDate: ${date}\nTime: ${startTime}\nDuration: ${duration}h\nPeople: ${people}\nTotal: ₹${pricing ? Math.round(pricing.total / 100) : 0}`
    )
  }

  const canBook = selectedSpace && date && startTime && duration > 0

  const formContent = (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleBook() }} role="form" aria-label="Book this space">
      {/* Space selector (if multiple) */}
      {activeSpaces.length > 1 && (
        <div>
          <label htmlFor="bw-space" className="mb-1.5 block text-sm font-medium text-foreground">
            Space
          </label>
          <select
            id="bw-space"
            value={selectedSpaceId ?? ""}
            onChange={(e) => onSelectSpace(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            <option value="" disabled>
              Select a space
            </option>
            {activeSpaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — ₹{Math.round(s.pricePerHour / 100)}/hr
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div>
        <label htmlFor="bw-date" className="mb-1.5 block text-sm font-medium text-foreground">
          <Calendar className="mr-1.5 inline size-4 text-muted-foreground" />
          Date
        </label>
        <input
          id="bw-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        />
      </div>

      {/* Start time */}
      <div>
        <label htmlFor="bw-time" className="mb-1.5 block text-sm font-medium text-foreground">
          <Clock className="mr-1.5 inline size-4 text-muted-foreground" />
          Start time
        </label>
        <input
          id="bw-time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          step={1800}
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        />
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="bw-duration" className="mb-1.5 block text-sm font-medium text-foreground">
          Duration
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setDuration(h)}
              className={cn(
                "flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-colors",
                duration === h
                  ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
                  : "border-border text-muted-foreground hover:border-perch-primary-300"
              )}
              aria-pressed={duration === h}
              aria-label={`${h} hour${h > 1 ? "s" : ""} duration`}
            >
              {h}h
            </button>
          ))}
          <input
            id="bw-duration"
            type="number"
            min={1}
            max={8}
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Math.min(8, Number(e.target.value))))}
            className={cn(
              "w-16 rounded-lg border border-input bg-transparent px-2 py-2 text-center text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label="Custom duration in hours"
          />
        </div>
      </div>

      {/* People */}
      <div>
        <label htmlFor="bw-people" className="mb-1.5 block text-sm font-medium text-foreground">
          <Users className="mr-1.5 inline size-4 text-muted-foreground" />
          People
        </label>
        <input
          id="bw-people"
          type="number"
          min={1}
          max={selectedSpace?.capacityMax ?? 20}
          value={people}
          onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        />
        {selectedSpace && (
          <p className="mt-1 text-xs text-muted-foreground">
            Capacity: {selectedSpace.capacityMin}-{selectedSpace.capacityMax} people
          </p>
        )}
      </div>

      {/* Price breakdown */}
      {pricing && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>
              ₹{Math.round(selectedSpace!.pricePerHour / 100)} × {duration}h
            </span>
            <span>₹{Math.round(pricing.base / 100)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform fee (5%)</span>
            <span>₹{Math.round(pricing.platformFee / 100)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GST (18%)</span>
            <span>₹{Math.round(pricing.gst / 100)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground">
            <span>Total</span>
            <span>₹{Math.round(pricing.total / 100)}</span>
          </div>
        </div>
      )}

      {/* Book button */}
      <Button
        type="submit"
        disabled={!canBook}
        size="lg"
        className="w-full"
      >
        {!isSignedIn
          ? "Sign in to book"
          : canBook
            ? `Book now — ₹${pricing ? Math.round(pricing.total / 100) : 0}`
            : "Select space & date"}
      </Button>

      {!isSignedIn && (
        <p className="text-center text-xs text-muted-foreground">
          You need to sign in before booking a space
        </p>
      )}
    </form>
  )

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-perch-dark/80 dark:border-stone-800">
          {selectedSpace && (
            <p className="mb-4 text-center">
              <span className="text-2xl font-bold text-foreground">
                ₹{Math.round(selectedSpace.pricePerHour / 100)}
              </span>
              <span className="text-sm text-muted-foreground">/hr</span>
            </p>
          )}
          {formContent}
        </div>
      </aside>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        {/* Collapsed bar */}
        <AnimatePresence>
          {!mobileOpen && (
            <motion.button
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={() => setMobileOpen(true)}
              className="flex w-full items-center justify-between border-t border-border bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:bg-stone-900 dark:border-stone-700"
              aria-label="Open booking form"
            >
              <div className="text-left">
                {selectedSpace ? (
                  <>
                    <span className="text-lg font-bold text-foreground">
                      ₹{Math.round(selectedSpace.pricePerHour / 100)}
                    </span>
                    <span className="text-sm text-muted-foreground">/hr</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Select a space to see pricing
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-perch-primary-500 px-4 py-2 text-sm font-semibold text-white">
                  Book
                </span>
                <ChevronUp className="size-5 text-muted-foreground" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expanded form */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-white p-5 pb-8 dark:bg-stone-900 dark:border-stone-700"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Book this space
                  </h3>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                    aria-label="Close booking form"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                {formContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export { BookingWidget }
export type { BookingWidgetProps }
