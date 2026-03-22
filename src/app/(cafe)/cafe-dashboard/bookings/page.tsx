import type { Metadata } from "next"
import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getOwnedCafe,
  getCafeBookingsByFilter,
} from "@/lib/queries/cafe-dashboard"
import { CafeBookingsClient } from "@/components/cafe-dashboard/bookings-client"

export const metadata: Metadata = { title: "Bookings" }

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
    </div>
  )
}

async function BookingsContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cafe = await getOwnedCafe(userId)
  if (!cafe) redirect("/onboarding")

  const [today, upcoming, completed, cancelled] = await Promise.all([
    getCafeBookingsByFilter(cafe.id, "today"),
    getCafeBookingsByFilter(cafe.id, "upcoming"),
    getCafeBookingsByFilter(cafe.id, "completed"),
    getCafeBookingsByFilter(cafe.id, "cancelled"),
  ])

  return (
    <CafeBookingsClient
      initialData={{ today, upcoming, completed, cancelled }}
    />
  )
}

function CafeBookingsPage() {
  return (
    <Suspense fallback={<BookingsSkeleton />}>
      <BookingsContent />
    </Suspense>
  )
}

export { CafeBookingsPage as default }
