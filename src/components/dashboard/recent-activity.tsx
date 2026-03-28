"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  Star,
  CalendarCheck,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { ActivityItem } from "@/types/dashboard"

const typeConfig: Record<
  ActivityItem["type"],
  { icon: typeof CheckCircle2; iconClass: string; dotClass: string }
> = {
  booking_completed: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    dotClass: "bg-emerald-500/10 border border-emerald-500/20",
  },
  booking_cancelled: {
    icon: XCircle,
    iconClass: "text-red-400",
    dotClass: "bg-red-500/10 border border-red-500/20",
  },
  booking_confirmed: {
    icon: CalendarCheck,
    iconClass: "text-blue-400",
    dotClass: "bg-blue-500/10 border border-blue-500/20",
  },
  review_left: {
    icon: Star,
    iconClass: "text-perch-primary-400",
    dotClass: "bg-perch-primary-500/10 border border-perch-primary-500/20",
  },
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Activity className="h-5 w-5 text-neutral-500" />
        </div>
        <p className="text-sm font-medium text-neutral-400">No activity yet</p>
        <p className="mt-1 text-xs text-neutral-600">
          Your bookings and reviews will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] overflow-hidden">
      <ul className="divide-y divide-white/6">
        {items.map((item, i) => {
          const config = typeConfig[item.type]
          const Icon = config.icon

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.dotClass)}>
                <Icon className={cn("h-3.5 w-3.5", config.iconClass)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-neutral-300">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-neutral-600">
                {timeAgo(item.timestamp)}
              </span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
