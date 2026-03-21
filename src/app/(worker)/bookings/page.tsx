"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatTime, formatDateMedium, formatPaise } from "@/lib/utils/format"
import type { BookingWithDetails } from "@/types/dashboard"

const tabs = [
  { key: "upcoming", label: "Upcoming", statuses: ["pending", "confirmed", "checked_in"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
] as const

type TabKey = (typeof tabs)[number]["key"]

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  checked_in: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed: "bg-neutral-100 text-neutral-600 dark:bg-stone-800 dark:text-neutral-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming")
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchBookings = useCallback(async (tab: TabKey) => {
    setLoading(true)
    setError(false)
    const statuses = tabs.find((t) => t.key === tab)!.statuses
    const params = new URLSearchParams()
    statuses.forEach((s) => params.append("status", s))

    try {
      const res = await fetch(`/api/bookings?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings(activeTab)
  }, [activeTab, fetchBookings])

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-neutral-100 p-1 dark:bg-stone-800" role="tablist" aria-label="Booking status filter">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
              activeTab === tab.key
                ? "bg-white text-foreground shadow-sm dark:bg-stone-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="h-6 w-6 animate-spin text-perch-primary-500" />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-neutral-600 dark:text-neutral-400">
              Something went wrong loading your bookings.
            </p>
            <button
              type="button"
              onClick={() => fetchBookings(activeTab)}
              className="mt-2 text-sm font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
            >
              Try again
            </button>
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-neutral-600 dark:text-neutral-400">
              No {activeTab} bookings yet
            </p>
            {activeTab === "upcoming" && (
              <Link
                href="/search"
                className="mt-2 inline-block text-sm font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
              >
                Find a space →
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className={cn(
                  "flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-colors",
                  "hover:border-perch-primary-200 hover:shadow-sm dark:bg-stone-900 dark:hover:border-perch-primary-800",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
                )}
              >
                {/* Date badge */}
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-perch-primary-50 dark:bg-perch-primary-950">
                  <span className="text-xs font-medium uppercase text-perch-primary-600 dark:text-perch-primary-400">
                    {new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold text-perch-primary-700 dark:text-perch-primary-300">
                    {new Date(booking.date + "T00:00:00").getDate()}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">
                      {booking.meetingTitle ?? booking.spaceName}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        statusColors[booking.status] ?? ""
                      )}
                      aria-label={`Status: ${booking.status.replace("_", " ")}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.cafeName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {booking.numAttendees}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {formatPaise(booking.totalAmount)} · {formatDateMedium(booking.date)}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookingsPage
