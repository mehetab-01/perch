import {
  Users,
  Store,
  CalendarDays,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Star,
  Clock,
} from "lucide-react"
import { getAdminStats, getAdminActivity } from "@/lib/queries/admin"
import { formatPaise } from "@/lib/utils/format"
import { cn } from "@/lib/utils/cn"

const activityIcons: Record<string, typeof Users> = {
  user_signup: UserPlus,
  cafe_created: Store,
  booking_made: CalendarDays,
  review_left: Star,
}

const activityColors: Record<string, string> = {
  user_signup: "text-blue-500",
  cafe_created: "text-emerald-500",
  booking_made: "text-perch-primary-500",
  review_left: "text-amber-500",
}

async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getAdminStats(),
    getAdminActivity(10),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Platform Overview</h1>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-neutral-500">
            <Users className="size-4" />
            <span className="text-xs font-medium">Total Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalUsers}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-neutral-500">
            <Store className="size-4" />
            <span className="text-xs font-medium">Cafes</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalCafes}</p>
          <div className="mt-1 flex gap-2 text-[11px]">
            <span className="text-emerald-600">{stats.cafesVerified} verified</span>
            <span className="text-amber-600">{stats.cafesPending} pending</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-neutral-500">
            <CalendarDays className="size-4" />
            <span className="text-xs font-medium">Bookings (month)</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.bookingsThisMonth}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-neutral-500">
            <IndianRupee className="size-4" />
            <span className="text-xs font-medium">GMV (month)</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatPaise(stats.gmvThisMonth)}</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 dark:bg-stone-900 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-neutral-500">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium">Revenue (month)</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatPaise(stats.revenueThisMonth)}</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-border bg-white dark:bg-stone-900">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {activity.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              No recent activity
            </p>
          ) : (
            activity.map((item) => {
              const Icon = activityIcons[item.type] ?? Clock
              const color = activityColors[item.type] ?? "text-neutral-500"
              return (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("shrink-0", color)}>
                    <Icon className="size-4" />
                  </div>
                  <p className="flex-1 text-sm text-foreground">{item.description}</p>
                  <time className="shrink-0 text-xs text-neutral-400">
                    {item.timestamp.toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export { AdminDashboardPage as default }
