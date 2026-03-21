"use client"

import Link from "next/link"
import {
  IndianRupee,
  CalendarDays,
  Star,
  CalendarOff,
  RefreshCw,
  ArrowRight,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPaise, formatTime, formatDateShort } from "@/lib/utils/format"
import type {
  CafeBookingWithDetails,
  CafeDashboardStats,
  CafeReviewWithDetails,
} from "@/types/cafe-dashboard"

type OverviewProps = {
  todaysBookings: CafeBookingWithDetails[]
  stats: CafeDashboardStats
  weekCounts: { date: string; count: number }[]
  recentReviews: CafeReviewWithDetails[]
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  checked_in: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name
}

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-IN", { weekday: "short" })
}

function dayNumber(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").getDate().toString()
}

function CafeOverviewClient({
  todaysBookings,
  stats,
  weekCounts,
  recentReviews,
}: OverviewProps) {
  const maxCount = Math.max(...weekCounts.map((d) => d.count), 1)

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
            <IndianRupee className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Earned this month
            </p>
            <p className="text-xl font-bold text-foreground">
              {formatPaise(stats.earnedThisMonth)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
            <CalendarDays className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Bookings this month
            </p>
            <p className="text-xl font-bold text-foreground">
              {stats.bookingsThisMonth}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
            <Star className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Average rating
            </p>
            <p className="text-xl font-bold text-foreground">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
            </p>
          </div>
        </Card>
      </div>

      {/* Today's bookings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Today&apos;s bookings
          </h2>
          <Link
            href="/cafe-dashboard/bookings"
            className="text-sm font-medium text-perch-primary-600 hover:text-perch-primary-700 dark:text-perch-primary-400"
          >
            View all
          </Link>
        </div>

        {todaysBookings.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <CalendarOff className="size-10 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No bookings scheduled for today
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {todaysBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {firstName(booking.workerName)}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          statusStyles[booking.status] ?? statusStyles.pending
                        )}
                      >
                        {booking.status === "checked_in" ? "Checked in" : booking.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                      </span>
                      <span>{booking.spaceName}</span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {booking.numAttendees}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPaise(booking.cafePayout)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* This week's calendar */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          This week
        </h2>
        <Card className="p-5">
          <div className="flex items-end justify-between gap-2">
            {weekCounts.map((day) => {
              const today = new Date().toISOString().split("T")[0]
              const isToday = day.date === today
              const barHeight = day.count > 0 ? (day.count / maxCount) * 64 : 4

              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-16 items-end">
                    <div
                      className={cn(
                        "w-full min-w-6 max-w-10 rounded-t-md transition-all",
                        day.count > 0
                          ? "bg-perch-primary-400 dark:bg-perch-primary-600"
                          : "bg-neutral-200 dark:bg-stone-700"
                      )}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        isToday
                          ? "text-perch-primary-600 dark:text-perch-primary-400"
                          : "text-neutral-500 dark:text-neutral-400"
                      )}
                    >
                      {dayLabel(day.date)}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isToday
                          ? "text-perch-primary-600 dark:text-perch-primary-400"
                          : "text-foreground"
                      )}
                    >
                      {dayNumber(day.date)}
                    </p>
                  </div>
                  {day.count > 0 && (
                    <p className="text-xs text-neutral-400">{day.count}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      {/* Recent reviews */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Recent reviews
          </h2>
          <Link
            href="/cafe-dashboard/reviews"
            className="text-sm font-medium text-perch-primary-600 hover:text-perch-primary-700 dark:text-perch-primary-400"
          >
            View all
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <Star className="size-10 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No reviews yet
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {firstName(review.workerName)}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3.5",
                              i < review.overallRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300 dark:text-neutral-600"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/cafe-dashboard/spaces">
            <Card className="flex items-center gap-3 p-4 hover:border-perch-primary-300 dark:hover:border-perch-primary-700">
              <CalendarOff className="size-5 text-perch-primary-500" />
              <span className="text-sm font-medium text-foreground">
                Manage spaces
              </span>
              <ArrowRight className="ml-auto size-4 text-neutral-400" />
            </Card>
          </Link>
          <Link href="/cafe-dashboard/bookings">
            <Card className="flex items-center gap-3 p-4 hover:border-perch-primary-300 dark:hover:border-perch-primary-700">
              <CalendarDays className="size-5 text-perch-primary-500" />
              <span className="text-sm font-medium text-foreground">
                View all bookings
              </span>
              <ArrowRight className="ml-auto size-4 text-neutral-400" />
            </Card>
          </Link>
          <Link href="/cafe-dashboard/earnings">
            <Card className="flex items-center gap-3 p-4 hover:border-perch-primary-300 dark:hover:border-perch-primary-700">
              <IndianRupee className="size-5 text-perch-primary-500" />
              <span className="text-sm font-medium text-foreground">
                View earnings
              </span>
              <ArrowRight className="ml-auto size-4 text-neutral-400" />
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}

export { CafeOverviewClient }
