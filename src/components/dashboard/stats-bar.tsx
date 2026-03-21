import { CalendarDays, IndianRupee, Clock } from "lucide-react"
import { getDashboardStats } from "@/lib/queries/dashboard"
import { formatPaise } from "@/lib/utils/format"

const statConfig = [
  {
    key: "meetingsThisMonth" as const,
    label: "Meetings this month",
    icon: CalendarDays,
    format: (v: number) => String(v),
  },
  {
    key: "spentThisMonth" as const,
    label: "Spent this month",
    icon: IndianRupee,
    format: (v: number) => formatPaise(v),
  },
  {
    key: "hoursThisMonth" as const,
    label: "Hours booked",
    icon: Clock,
    format: (v: number) => `${v}h`,
  },
]

export async function StatsBar({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {statConfig.map((stat) => (
        <div
          key={stat.key}
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-stone-900"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-perch-primary-50 dark:bg-perch-primary-950">
            <stat.icon className="h-5 w-5 text-perch-primary-600 dark:text-perch-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stat.format(stats[stat.key])}
            </p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
