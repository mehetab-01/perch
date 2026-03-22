"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Clock, Users, ChevronRight, CalendarPlus } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatTime } from "@/lib/utils/format"
import type { BookingWithDetails } from "@/types/dashboard"

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  checked_in: {
    label: "Checked in",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
}

export function UpcomingBookings({ bookings }: { bookings: BookingWithDetails[] }) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-perch-primary-500/20 bg-perch-primary-500/10">
          <CalendarPlus className="h-6 w-6 text-perch-primary-400" />
        </div>
        <p className="text-sm font-medium text-neutral-300">No upcoming bookings</p>
        <p className="mt-1 text-xs text-neutral-600">Find and book a space to get started</p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-4 py-2 text-xs font-semibold text-black transition-all hover:opacity-90"
        >
          Find a space
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {bookings.map((booking, i) => {
        const status = statusConfig[booking.status]
        const day = new Date(booking.date + "T00:00:00")

        return (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <Link
              href={`/bookings/${booking.id}`}
              className={cn(
                "group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 transition-all",
                "hover:border-perch-primary-500/30 hover:bg-white/[0.07]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
              )}
            >
              {/* Date badge */}
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-perch-primary-500/20 bg-perch-primary-500/10">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-perch-primary-400">
                  {day.toLocaleDateString("en-IN", { month: "short" })}
                </span>
                <span className="text-lg font-bold leading-none text-perch-primary-300">
                  {day.getDate()}
                </span>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-neutral-100">
                    {booking.meetingTitle ?? booking.spaceName}
                  </h3>
                  {status && (
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", status.className)}>
                      {status.label}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-neutral-600" />
                    {booking.cafeName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-neutral-600" />
                    {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-neutral-600" />
                    {booking.numAttendees}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-700 transition-colors group-hover:text-neutral-400" />
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
