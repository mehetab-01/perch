"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle2, CalendarPlus, QrCode, ArrowRight,
  MapPin, Clock, Users, IndianRupee, Download,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number) as [number, number]
  const suffix = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
}

function getEndTime(startTime: string, duration: number) {
  const [h] = startTime.split(":").map(Number) as [number]
  const endH = h + duration
  return `${String(endH).padStart(2, "0")}:00`
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
}

type Props = {
  bookingId: string
  cafeName: string
  spaceName: string
  date: string
  startTime: string
  duration: number
  totalAmount: number // paise
}

export function BookingConfirmation({
  bookingId, cafeName, spaceName, date, startTime, duration, totalAmount,
}: Props) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const endTime = getEndTime(startTime, duration)

  // Generate QR code from booking ID
  useEffect(() => {
    import("qrcode").then(({ toDataURL }) => {
      toDataURL(`PERCH:${bookingId}`, {
        width: 200,
        margin: 1,
        color: { dark: "#F59E0B", light: "#111110" },
      }).then(setQrUrl).catch(() => null)
    })
  }, [bookingId])

  function buildGoogleCalendarUrl() {
    const dateCompact = date.replace(/-/g, "")
    const startH = startTime.replace(":", "")
    const endH = endTime.replace(":", "")
    const start = `${dateCompact}T${startH}00`
    const end = `${dateCompact}T${endH}00`
    const title = encodeURIComponent(`Meeting at ${cafeName} — ${spaceName}`)
    const details = encodeURIComponent(`Booking ID: ${bookingId}\nBooked via Perch`)
    const location = encodeURIComponent(cafeName)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success header */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="mb-6 flex flex-col items-center text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 border border-emerald-500/20 mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Booking Confirmed!</h1>
          <p className="mt-1.5 text-sm text-neutral-400">
            Your space is reserved. See you at {cafeName}!
          </p>
        </motion.div>

        {/* Ticket card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-white/10 bg-[#111110] overflow-hidden"
        >
          {/* Top band */}
          <div className="bg-gradient-to-r from-perch-primary-500/20 to-perch-primary-400/10 border-b border-white/8 px-5 py-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Booking ID</p>
            <p className="font-mono font-bold text-perch-primary-300 text-lg tracking-wider">{bookingId}</p>
          </div>

          {/* Booking details */}
          <div className="px-5 py-4 space-y-3 border-b border-white/8">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{cafeName}</p>
                <p className="text-xs text-neutral-500">{spaceName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarPlus className="h-4 w-4 text-neutral-500 shrink-0" />
              <p className="text-sm text-neutral-300">{formatDateLong(date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-neutral-500 shrink-0" />
              <p className="text-sm text-neutral-300">
                {formatTime(startTime)} – {formatTime(endTime)} · {duration}h
              </p>
            </div>
            <div className="flex items-center gap-3">
              <IndianRupee className="h-4 w-4 text-neutral-500 shrink-0" />
              <p className="text-sm text-neutral-300">
                ₹{(totalAmount / 100).toLocaleString("en-IN")} total (charged after meeting)
              </p>
            </div>
          </div>

          {/* QR code */}
          <div className="flex flex-col items-center py-5 border-b border-white/8 border-dashed">
            {qrUrl ? (
              <img src={qrUrl} alt="Booking QR code" className="h-40 w-40 rounded-xl" />
            ) : (
              <div className="h-40 w-40 rounded-xl border border-white/8 bg-white/3 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-neutral-600" />
              </div>
            )}
            <p className="mt-2 text-xs text-neutral-600">Show this at the cafe for check-in</p>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2.5">
            <a
              href={buildGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-perch-primary-500/30 bg-perch-primary-500/10 py-2.5 text-sm font-medium text-perch-primary-300 transition-all hover:bg-perch-primary-500/20"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to Google Calendar
            </a>
            <Link
              href="/bookings"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:bg-white/8 hover:text-white"
            >
              View All Bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center text-xs text-neutral-600"
        >
          A confirmation has been sent to your email.
        </motion.p>
      </div>
    </div>
  )
}
