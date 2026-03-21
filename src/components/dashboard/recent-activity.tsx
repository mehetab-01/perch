"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  Star,
  CalendarCheck,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { ActivityItem } from "@/types/dashboard"

const typeConfig: Record<
  ActivityItem["type"],
  { icon: typeof CheckCircle2; color: string }
> = {
  booking_completed: {
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  },
  booking_cancelled: {
    icon: XCircle,
    color: "text-red-500 bg-red-50 dark:bg-red-950",
  },
  booking_confirmed: {
    icon: CalendarCheck,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  },
  review_left: {
    icon: Star,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950",
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
      <div className="rounded-xl border border-border bg-white p-8 text-center dark:bg-stone-900">
        <p className="text-neutral-600 dark:text-neutral-400">No recent activity yet</p>
        <p className="mt-1 text-sm text-neutral-500">
          Activity will appear here as you book and review spaces.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-stone-900">
      <ul className="divide-y divide-border">
        {items.map((item, i) => {
          const config = typeConfig[item.type]
          const Icon = config.icon

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {timeAgo(item.timestamp)}
              </span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
