import { Suspense } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getUpcomingBookings,
  getQuickBookCafes,
  getRecentActivity,
  getReviewableBookings,
} from "@/lib/queries/dashboard"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { UpcomingBookings } from "@/components/dashboard/upcoming-bookings"
import { QuickBook } from "@/components/dashboard/quick-book"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ReviewPrompt } from "@/components/booking/review-prompt"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { FavouriteCafes } from "@/components/dashboard/favourite-cafes"

export const metadata = {
  title: "Dashboard | Perch",
  description: "Your workspace booking dashboard",
}

async function DashboardContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [clerkUser, upcomingBookings, quickBookCafes, recentActivity, reviewableBookings] =
    await Promise.all([
      currentUser(),
      getUpcomingBookings(userId),
      getQuickBookCafes(userId),
      getRecentActivity(userId),
      getReviewableBookings(userId, 1),
    ])

  const firstName = clerkUser?.firstName ?? "there"
  const reviewableBooking = reviewableBookings[0] ?? null

  // Server-rendered sections passed as slots into the client tab switcher
  const statsSlot = (
    <Suspense fallback={<div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5"/>)}</div>}>
      <StatsBar userId={userId} />
    </Suspense>
  )

  const upcomingSlot = (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-white/5"/>}>
      <UpcomingBookings bookings={upcomingBookings} />
    </Suspense>
  )

  const activitySlot = (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-white/5"/>}>
      <RecentActivity items={recentActivity} />
    </Suspense>
  )

  const quickBookSlot = quickBookCafes.length > 0 ? (
    <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-white/5"/>}>
      <QuickBook cafes={quickBookCafes} />
    </Suspense>
  ) : null

  const reviewSlot = reviewableBooking ? (
    <ReviewPrompt
      bookingId={reviewableBooking.id}
      cafeName={reviewableBooking.cafeName}
      variant="banner"
    />
  ) : null

  const favouritesSlot = (
    <FavouriteCafes />
  )

  return (
    <DashboardTabs
      firstName={firstName}
      userId={userId}
      hasQuickBook={quickBookCafes.length > 0}
      statsSlot={statsSlot}
      upcomingSlot={upcomingSlot}
      activitySlot={activitySlot}
      quickBookSlot={quickBookSlot}
      reviewSlot={reviewSlot}
      favouritesSlot={favouritesSlot}
    />
  )
}

function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-white/5" />
          <div className="h-36 animate-pulse rounded-2xl bg-white/5" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

export { DashboardPage as default }
