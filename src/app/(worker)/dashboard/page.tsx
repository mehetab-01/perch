import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getUpcomingBookings,
  getQuickBookCafes,
  getRecentActivity,
} from "@/lib/queries/dashboard"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { UpcomingBookings } from "@/components/dashboard/upcoming-bookings"
import { QuickBook } from "@/components/dashboard/quick-book"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export const metadata = {
  title: "Dashboard | Perch",
  description: "Your workspace booking dashboard",
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
        />
      ))}
    </div>
  )
}

function BookingsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
        />
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="h-40 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800" />
  )
}

async function DashboardContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [upcomingBookings, quickBookCafes, recentActivity] = await Promise.all([
    getUpcomingBookings(userId),
    getQuickBookCafes(userId),
    getRecentActivity(userId),
  ])

  return (
    <div className="space-y-8">
      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsBar userId={userId} />
      </Suspense>

      {/* Upcoming bookings */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Upcoming bookings
        </h2>
        <UpcomingBookings bookings={upcomingBookings} />
      </section>

      {/* Quick rebook */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick rebook
        </h2>
        <QuickBook cafes={quickBookCafes} />
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent activity
        </h2>
        <RecentActivity items={recentActivity} />
      </section>
    </div>
  )
}

function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <StatsSkeleton />
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Upcoming bookings
            </h2>
            <BookingsSkeleton />
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Quick rebook
            </h2>
            <CardSkeleton />
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Recent activity
            </h2>
            <CardSkeleton />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

export default DashboardPage
