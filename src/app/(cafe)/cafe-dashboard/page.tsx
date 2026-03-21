import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getOwnedCafe,
  getTodaysBookings,
  getCafeDashboardStats,
  getWeekBookingCounts,
  getRecentCafeReviews,
} from "@/lib/queries/cafe-dashboard"
import { CafeOverviewClient } from "@/components/cafe-dashboard/overview-client"

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
    </div>
  )
}

async function OverviewContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cafe = await getOwnedCafe(userId)
  if (!cafe) redirect("/onboarding")

  const [todaysBookings, stats, weekCounts, recentReviews] = await Promise.all([
    getTodaysBookings(cafe.id),
    getCafeDashboardStats(cafe.id),
    getWeekBookingCounts(cafe.id),
    getRecentCafeReviews(cafe.id, 3),
  ])

  return (
    <CafeOverviewClient
      todaysBookings={todaysBookings}
      stats={stats}
      weekCounts={weekCounts}
      recentReviews={recentReviews}
    />
  )
}

function CafeDashboardPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  )
}

export default CafeDashboardPage
