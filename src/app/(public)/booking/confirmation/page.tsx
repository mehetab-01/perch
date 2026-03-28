"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"

function ConfirmationContent() {
  const params = useSearchParams()
  const id = params.get("id") ?? "BK000000"
  const cafe = params.get("cafe") ?? "The Bandra Brew"
  const space = params.get("space") ?? "Focus Nook"
  const date = params.get("date") ?? new Date().toISOString().split("T")[0]!
  const time = params.get("time") ?? "10:00"
  const duration = parseInt(params.get("duration") ?? "2", 10)
  const total = parseInt(params.get("total") ?? "0", 10)

  return (
    <BookingConfirmation
      bookingId={id}
      cafeName={cafe}
      spaceName={space}
      date={date}
      startTime={time}
      duration={duration}
      totalAmount={total}
    />
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0A09] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-perch-primary-400 border-t-transparent" /></div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
