"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Clock, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatTime, formatDateShort } from "@/lib/utils/format"
import type { BookingWithDetails } from "@/types/dashboard"

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  checked_in: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
}

export function UpcomingBookings({
  bookings,
}: {
  bookings: BookingWithDetails[]
}) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center dark:bg-stone-900">
        <p className="text-neutral-600 dark:text-neutral-400">No upcoming bookings yet</p>
        <Link
          href="/search"
          className="mt-2 inline-block text-sm font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
        >
          Find a space →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking, i) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link
            href={`/bookings/${booking.id}`}
            className={cn(
              "flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-colors",
              "hover:border-perch-primary-200 hover:shadow-sm dark:bg-stone-900 dark:hover:border-perch-primary-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
            )}
          >
            {/* Date badge */}
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-perch-primary-50 dark:bg-perch-primary-950">
              <span className="text-xs font-medium text-perch-primary-600 dark:text-perch-primary-400">
                {formatDateShort(booking.date).split(" ")[0]}
              </span>
              <span className="text-lg font-bold text-perch-primary-700 dark:text-perch-primary-300">
                {new Date(booking.date + "T00:00:00").getDate()}
              </span>
            </div>

            {/* Details */}
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
            </div>

            <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" />
          </Link>
        </motion.div>
      ))}

      <Link
        href="/bookings"
        className="block text-center text-sm font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
      >
        View all bookings →
      </Link>
    </div>
  )
}
