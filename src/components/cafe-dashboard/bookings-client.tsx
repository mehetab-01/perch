"use client"

import { useState, useCallback } from "react"
import {
  Clock,
  Users,
  CheckCircle2,
  X,
  Loader2,
  Hash,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { formatPaise, formatTime, formatDateShort } from "@/lib/utils/format"
import type { CafeBookingWithDetails } from "@/types/cafe-dashboard"

type TabKey = "today" | "upcoming" | "completed" | "cancelled"

type BookingsProps = {
  initialData: Record<TabKey, CafeBookingWithDetails[]>
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
]

const statusStyles: Record<string, { bg: string; label: string }> = {
  pending: {
    bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    label: "Pending",
  },
  confirmed: {
    bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    label: "Confirmed",
  },
  checked_in: {
    bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    label: "Checked in",
  },
  completed: {
    bg: "bg-neutral-100 text-neutral-700 dark:bg-stone-800 dark:text-neutral-300",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    label: "Cancelled",
  },
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name
}

function isPassedEndTime(date: string, endTime: string): boolean {
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  if (date !== today) return false
  const [h, m] = endTime.split(":").map(Number)
  const endDate = new Date()
  endDate.setHours(h!, m!, 0, 0)
  return now > endDate
}

function CafeBookingsClient({ initialData }: BookingsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("today")
  const [data, setData] = useState(initialData)
  const [checkinModalBooking, setCheckinModalBooking] = useState<CafeBookingWithDetails | null>(null)
  const [checkinToken, setCheckinToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCheckin = useCallback(async () => {
    if (!checkinModalBooking || !checkinToken.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/bookings/${checkinModalBooking.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkinToken: checkinToken.trim() }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Check-in failed")
      }

      // Update local state
      setData((prev) => ({
        ...prev,
        today: prev.today.map((b) =>
          b.id === checkinModalBooking.id ? { ...b, status: "checked_in" as const } : b
        ),
        upcoming: prev.upcoming.map((b) =>
          b.id === checkinModalBooking.id ? { ...b, status: "checked_in" as const } : b
        ),
      }))

      toast("Check-in successful!", "success")
      setCheckinModalBooking(null)
      setCheckinToken("")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Check-in failed", "error")
    } finally {
      setIsSubmitting(false)
    }
  }, [checkinModalBooking, checkinToken, toast])

  const handleComplete = useCallback(
    async (bookingId: string) => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/complete`, {
          method: "POST",
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? "Failed to mark complete")
        }

        setData((prev) => ({
          ...prev,
          today: prev.today.map((b) =>
            b.id === bookingId ? { ...b, status: "completed" as const } : b
          ),
          completed: [
            ...prev.today.filter((b) => b.id === bookingId).map((b) => ({
              ...b,
              status: "completed" as const,
            })),
            ...prev.completed,
          ],
        }))

        toast("Booking marked as completed", "success")
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed", "error")
      }
    },
    [toast]
  )

  const currentBookings = data[activeTab]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Bookings</h1>

      {/* Tab filters */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
              activeTab === tab.key
                ? "bg-perch-primary-500 text-white dark:bg-perch-primary-600"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-stone-800 dark:text-neutral-400 dark:hover:bg-stone-700"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({data[tab.key].length})
            </span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      {currentBookings.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No {activeTab} bookings
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentBookings.map((booking) => {
            const style = statusStyles[booking.status] ?? statusStyles.pending!
            const showCheckin =
              activeTab === "today" &&
              (booking.status === "confirmed" || booking.status === "pending")
            const showComplete =
              activeTab === "today" &&
              booking.status === "checked_in" &&
              isPassedEndTime(booking.date, booking.endTime)

            return (
              <Card key={booking.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {firstName(booking.workerName)}
                      </p>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", style.bg)}>
                        {style.label}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{booking.spaceName}</span>
                      <span>{formatDateShort(booking.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                      </span>
                      <span>{booking.durationHours}h</span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {booking.numAttendees}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPaise(booking.cafePayout)}
                    </p>

                    {showCheckin && (
                      <Button
                        size="sm"
                        onClick={() => setCheckinModalBooking(booking)}
                      >
                        <CheckCircle2 className="size-4" />
                        Check-in
                      </Button>
                    )}

                    {showComplete && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleComplete(booking.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Check-in modal */}
      <AnimatePresence>
        {checkinModalBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => {
              if (!isSubmitting) {
                setCheckinModalBooking(null)
                setCheckinToken("")
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl dark:bg-stone-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Check-in guest
                </h3>
                <button
                  onClick={() => {
                    setCheckinModalBooking(null)
                    setCheckinToken("")
                  }}
                  disabled={isSubmitting}
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mb-4 rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
                <p className="text-sm font-medium text-foreground">
                  {firstName(checkinModalBooking.workerName)} — {checkinModalBooking.spaceName}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatTime(checkinModalBooking.startTime)} – {formatTime(checkinModalBooking.endTime)}
                </p>
              </div>

              <label className="mb-2 block text-sm font-medium text-foreground">
                Enter booking code or scan QR
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={checkinToken}
                  onChange={(e) => setCheckinToken(e.target.value)}
                  placeholder="Booking code..."
                  className="pl-9"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheckin()
                  }}
                />
              </div>

              <div className="mt-5 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCheckinModalBooking(null)
                    setCheckinToken("")
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCheckin}
                  disabled={isSubmitting || !checkinToken.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Verify & check in
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { CafeBookingsClient }
