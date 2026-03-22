"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  MapPin,
  Clock,
  Users,
  CalendarDays,
  IndianRupee,
  QrCode,
  XCircle,
  CheckCircle2,
  Circle,
  ArrowLeft,
  AlertTriangle,
  Repeat,
} from "lucide-react"
import { toDataURL } from "qrcode"
import { cn } from "@/lib/utils/cn"
import { formatTime, formatDateLong, formatPaise } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { ReviewPrompt } from "@/components/booking/review-prompt"
import { AgendaGenerator } from "@/components/booking/agenda-generator"
import { NotesGenerator } from "@/components/booking/notes-generator"
import { AddToCalendar } from "@/components/booking/add-to-calendar"
import type { BookingWithDetails } from "@/types/dashboard"

const statusSteps = [
  { key: "pending", label: "Booking placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "checked_in", label: "Checked in" },
  { key: "completed", label: "Completed" },
] as const

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  checked_in: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed: "bg-neutral-100 text-neutral-600 dark:bg-stone-800 dark:text-neutral-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

function getStepIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status)
  return idx === -1 ? -1 : idx
}

export function BookingDetail({
  booking,
  hasReview = false,
}: {
  booking: BookingWithDetails
  hasReview?: boolean
}) {
  const router = useRouter()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [savedAgenda, setSavedAgenda] = useState(booking.agenda)

  const isCancelled = booking.status === "cancelled"
  const isCompleted = booking.status === "completed"
  const canCancel =
    booking.status === "pending" || booking.status === "confirmed"
  const showQr =
    booking.status === "confirmed" && booking.checkinToken

  useEffect(() => {
    if (showQr && booking.checkinToken) {
      toDataURL(booking.checkinToken, {
        width: 200,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      }).then(setQrDataUrl)
    }
  }, [showQr, booking.checkinToken])

  async function handleCancel(cancelAll = false) {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, cancelAll }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  async function handleSaveAgenda(agenda: string) {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda }),
      })
      if (res.ok) {
        setSavedAgenda(agenda)
      }
    } catch {
      // silently fail — the agenda is still visible in the UI
    }
  }

  const currentStepIdx = getStepIndex(booking.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back button */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {booking.meetingTitle ?? booking.spaceName}
          </h1>
          <p className="mt-1 text-neutral-500">
            Booking #{booking.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {booking.isRecurring && (
            <span className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
              <Repeat className="size-3.5" />
              Series
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              statusColors[booking.status] ?? ""
            )}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Recurring series info */}
      {booking.isRecurring && booking.recurringGroupId && (
        <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/50">
          <Repeat className="size-5 shrink-0 text-purple-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              This is part of a recurring series
              {booking.recurrencePattern === "biweekly" ? " (every 2 weeks)" : " (weekly)"}
            </p>
          </div>
          <Link
            href={`/bookings?series=${booking.recurringGroupId}`}
            className="shrink-0 text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
          >
            View all in series
          </Link>
        </div>
      )}

      {/* Status timeline */}
      {!isCancelled && (
        <div className="rounded-xl border border-border bg-white p-6 dark:bg-stone-900">
          <h2 className="mb-4 font-semibold text-foreground">Status</h2>
          <div
            className="flex items-center gap-2"
            role="list"
            aria-label={`Booking progress: step ${currentStepIdx + 1} of ${statusSteps.length}`}
          >
            {statusSteps.map((step, i) => {
              const isReached = i <= currentStepIdx
              const isCurrent = i === currentStepIdx

              return (
                <div
                  key={step.key}
                  className="flex items-center gap-2"
                  role="listitem"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div className="flex flex-col items-center">
                    {isReached ? (
                      <CheckCircle2
                        className={cn(
                          "h-6 w-6",
                          isCurrent
                            ? "text-perch-primary-500"
                            : "text-emerald-500"
                        )}
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle className="h-6 w-6 text-neutral-300 dark:text-neutral-600" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        "mt-1 text-xs",
                        isReached
                          ? "font-medium text-foreground"
                          : "text-neutral-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={cn(
                        "mb-5 h-0.5 w-8 sm:w-12",
                        i < currentStepIdx
                          ? "bg-emerald-500"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">
              Booking cancelled
            </p>
            {booking.cancelReason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                Reason: {booking.cancelReason}
              </p>
            )}
            {booking.cancelledAt && (
              <p className="mt-1 text-sm text-red-500">
                Cancelled on{" "}
                {new Date(booking.cancelledAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking details */}
        <div className="rounded-xl border border-border bg-white p-6 dark:bg-stone-900">
          <h2 className="mb-4 font-semibold text-foreground">Details</h2>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 text-neutral-400" />
              <div>
                <dt className="text-sm text-neutral-500">Date</dt>
                <dd className="font-medium text-foreground">
                  {formatDateLong(booking.date)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-neutral-400" />
              <div>
                <dt className="text-sm text-neutral-500">Time</dt>
                <dd className="font-medium text-foreground">
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}{" "}
                  ({booking.durationHours}h)
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-neutral-400" />
              <div>
                <dt className="text-sm text-neutral-500">Location</dt>
                <dd className="font-medium text-foreground">
                  {booking.cafeName}
                </dd>
                <dd className="text-sm text-neutral-500">
                  {booking.cafeAddress}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-neutral-400" />
              <div>
                <dt className="text-sm text-neutral-500">Attendees</dt>
                <dd className="font-medium text-foreground">
                  {booking.numAttendees} {booking.numAttendees === 1 ? "person" : "people"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 text-neutral-400" aria-hidden="true" />
              <div>
                <dt className="text-sm text-neutral-500">Space</dt>
                <dd className="font-medium text-foreground">
                  {booking.spaceName}
                </dd>
              </div>
            </div>
            {savedAgenda && (
              <div>
                <dt className="text-sm text-neutral-500">Agenda</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                  {savedAgenda}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* AI Agenda Generator — for non-cancelled bookings with a title */}
        {!isCancelled && booking.meetingTitle && (
          <AgendaGenerator
            meetingTitle={booking.meetingTitle}
            durationHours={booking.durationHours}
            attendees={booking.numAttendees}
            existingAgenda={savedAgenda}
            onSave={handleSaveAgenda}
          />
        )}

        {/* Payment + QR */}
        <div className="space-y-6">
          {/* Payment breakdown */}
          <div className="rounded-xl border border-border bg-white p-6 dark:bg-stone-900">
            <h2 className="mb-4 font-semibold text-foreground">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-foreground">
                  {formatPaise(booking.totalAmount - booking.platformFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Platform fee</span>
                <span className="text-foreground">
                  {formatPaise(booking.platformFee)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="flex items-center gap-1 text-foreground">
                    <IndianRupee className="h-4 w-4" />
                    {formatPaise(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR code */}
          {showQr && (
            <div className="rounded-xl border border-border bg-white p-6 text-center dark:bg-stone-900">
              <h2 className="mb-4 font-semibold text-foreground">
                Check-in QR Code
              </h2>
              <div className="flex items-center justify-center">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt={`QR code for checking in at ${booking.cafeName}`}
                    width={200}
                    height={200}
                    className="rounded-lg"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-neutral-100 dark:bg-stone-800">
                    <QrCode className="h-12 w-12 text-neutral-400" />
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-neutral-500">
                Show this QR code at the cafe to check in
              </p>
            </div>
          )}

          {/* Add to Calendar — for confirmed or checked-in bookings */}
          {(booking.status === "confirmed" || booking.status === "checked_in") && (
            <AddToCalendar
              event={{
                id: booking.id,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                cafeName: booking.cafeName,
                cafeAddress: booking.cafeAddress,
                spaceName: booking.spaceName,
                numAttendees: booking.numAttendees,
                meetingTitle: booking.meetingTitle,
                agenda: savedAgenda,
                isRecurring: booking.isRecurring,
                recurrencePattern: booking.recurrencePattern,
              }}
            />
          )}

          {/* Review prompt */}
          {isCompleted && !hasReview && (
            <ReviewPrompt
              bookingId={booking.id}
              cafeName={booking.cafeName}
              variant="card"
            />
          )}

          {/* AI Notes Generator — for completed bookings with a title */}
          {isCompleted && booking.meetingTitle && (
            <NotesGenerator
              meetingTitle={booking.meetingTitle}
              durationHours={booking.durationHours}
              existingAgenda={savedAgenda}
            />
          )}
        </div>
      </div>

      {/* Cancel booking */}
      {canCancel && !showCancelConfirm && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowCancelConfirm(true)}
          >
            <XCircle className="h-4 w-4" />
            Cancel booking
          </Button>
        </div>
      )}

      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/50"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="flex-1 space-y-3">
              <p className="font-medium text-red-700 dark:text-red-400">
                Are you sure you want to cancel this booking?
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className={cn(
                  "w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-foreground placeholder:text-neutral-400",
                  "focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-800 dark:bg-stone-900"
                )}
                rows={2}
                maxLength={500}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancel(false)}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : booking.isRecurring ? "Cancel this session" : "Yes, cancel"}
                </Button>
                {booking.isRecurring && booking.recurringGroupId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(true)}
                    disabled={cancelling}
                    className="bg-red-700 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900"
                  >
                    {cancelling ? "Cancelling..." : "Cancel all remaining"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep booking
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
