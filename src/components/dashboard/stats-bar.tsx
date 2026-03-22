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
          className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm"
        >
          {/* Subtle amber top-left glow */}
          <div
            className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-perch-primary-500"
            style={{ filter: "blur(28px)", opacity: 0.14 }}
          />
          <div className="relative flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-perch-primary-500/20 bg-perch-primary-500/10">
              <stat.icon className="h-5 w-5 text-perch-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stat.format(stats[stat.key])}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
