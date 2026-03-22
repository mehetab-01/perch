import { Suspense } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
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
import { Search } from "lucide-react"

export const metadata = {
  title: "Dashboard | Perch",
  description: "Your workspace booking dashboard",
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  )
}

function BookingsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  )
}

function CardSkeleton() {
  return <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
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

  return (
    <div className="space-y-8">
      {/* Hero greeting banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-[#1a1500] via-[#0f0d00] to-[#0C0A09] p-6 lg:p-8">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-perch-primary-500"
          style={{ filter: "blur(80px)", opacity: 0.12 }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 right-8 h-48 w-48 rounded-full bg-perch-accent"
          style={{ filter: "blur(70px)", opacity: 0.08 }}
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-perch-primary-400 mb-1">Good day</p>
            <h1 className="text-2xl font-bold text-white font-display lg:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Here&apos;s what&apos;s happening with your bookings today.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90 hover:shadow-lg hover:shadow-perch-primary-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
          >
            <Search className="h-4 w-4" />
            Find a space
          </Link>
        </div>
      </div>

      {/* Review banner */}
      {reviewableBookings.length > 0 && (
        <ReviewPrompt
          bookingId={reviewableBookings[0]!.id}
          cafeName={reviewableBookings[0]!.cafeName}
          variant="banner"
        />
      )}

      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsBar userId={userId} />
      </Suspense>

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
        {/* Left: upcoming bookings (wider) */}
        <section className="xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-200">Upcoming bookings</h2>
            <Link
              href="/bookings"
              className="text-xs font-medium text-perch-primary-400 hover:text-perch-primary-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <Suspense fallback={<BookingsSkeleton />}>
            <UpcomingBookings bookings={upcomingBookings} />
          </Suspense>
        </section>

        {/* Right: recent activity */}
        <section className="xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-neutral-200">Recent activity</h2>
          </div>
          <Suspense fallback={<CardSkeleton />}>
            <RecentActivity items={recentActivity} />
          </Suspense>
        </section>
      </div>

      {/* Quick rebook */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-200">Quick rebook</h2>
          <Link
            href="/search"
            className="text-xs font-medium text-perch-primary-400 hover:text-perch-primary-300 transition-colors"
          >
            Explore all →
          </Link>
        </div>
        <Suspense fallback={<CardSkeleton />}>
          <QuickBook cafes={quickBookCafes} />
        </Suspense>
      </section>
    </div>
  )
}

function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="h-36 animate-pulse rounded-2xl bg-white/5" />
          <StatsSkeleton />
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
            <div className="xl:col-span-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
            <div className="xl:col-span-2">
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
            </div>
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

export { DashboardPage as default }
