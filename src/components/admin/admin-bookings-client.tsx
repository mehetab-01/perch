"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  IndianRupee,
  X,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { formatPaise, formatTime, formatDateShort } from "@/lib/utils/format"
import type { AdminBooking } from "@/types/admin"

type StatusFilter = "all" | "pending" | "confirmed" | "checked_in" | "completed" | "cancelled"

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  checked_in: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  completed: "Completed",
  cancelled: "Cancelled",
}

function AdminBookingsClient({ bookings }: { bookings: AdminBooking[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  const statusCounts: Record<StatusFilter, number> = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    checked_in: bookings.filter((b) => b.status === "checked_in").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ]

  async function handleForceCancel() {
    if (!selectedBooking) return
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/admin/bookings/${selectedBooking.id}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancelReason || "Cancelled by admin" }),
        }
      )
      if (res.ok) {
        setSelectedBooking(null)
        setCancelReason("")
        router.refresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canCancel =
    selectedBooking &&
    selectedBooking.status !== "cancelled" &&
    selectedBooking.status !== "completed"

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "shrink-0 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              filter === t.key
                ? "border-foreground text-foreground"
                : "border-transparent text-neutral-500 hover:text-foreground"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-neutral-400">
              ({statusCounts[t.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">
          No bookings found
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 dark:bg-stone-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {booking.spaceName}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      statusBadge[booking.status]
                    )}
                  >
                    {statusLabel[booking.status]}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {booking.workerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {booking.cafeName}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {formatDateShort(booking.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatTime(booking.startTime)} –{" "}
                    {formatTime(booking.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    {formatPaise(booking.totalAmount)}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBooking(booking)
                  setCancelReason("")
                }}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Detail / cancel modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-xl dark:bg-stone-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-1 text-neutral-400 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Space</span>
                  <span className="font-medium text-foreground">
                    {selectedBooking.spaceName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cafe</span>
                  <span className="font-medium text-foreground">
                    {selectedBooking.cafeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Worker</span>
                  <span className="font-medium text-foreground">
                    {selectedBooking.workerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date</span>
                  <span className="font-medium text-foreground">
                    {formatDateShort(selectedBooking.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Time</span>
                  <span className="font-medium text-foreground">
                    {formatTime(selectedBooking.startTime)} –{" "}
                    {formatTime(selectedBooking.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount</span>
                  <span className="font-medium text-foreground">
                    {formatPaise(selectedBooking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Platform Fee</span>
                  <span className="font-medium text-foreground">
                    {formatPaise(selectedBooking.platformFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      statusBadge[selectedBooking.status]
                    )}
                  >
                    {statusLabel[selectedBooking.status]}
                  </span>
                </div>
              </div>

              {/* Force cancel */}
              {canCancel && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3.5" />
                    Admin force-cancel issues a full refund
                  </div>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Cancellation reason (optional)"
                    className="w-full rounded-lg border border-border bg-transparent p-3 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring dark:border-stone-700"
                    rows={2}
                    maxLength={500}
                  />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleForceCancel}
                    disabled={submitting}
                  >
                    {submitting ? "Cancelling..." : "Force Cancel Booking"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { AdminBookingsClient }
