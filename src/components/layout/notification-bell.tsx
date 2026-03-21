"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  CalendarCheck,
  CalendarPlus,
  XCircle,
  Star,
  IndianRupee,
  Clock,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"

type NotificationItem = {
  id: string
  type: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

const POLL_INTERVAL = 30_000

const typeIcons: Record<string, typeof Bell> = {
  booking_confirmed: CalendarCheck,
  new_booking: CalendarPlus,
  booking_cancelled: XCircle,
  review_received: Star,
  payout_settled: IndianRupee,
  reminder: Clock,
}

const typeColors: Record<string, string> = {
  booking_confirmed: "text-emerald-500",
  new_booking: "text-blue-500",
  booking_cancelled: "text-red-500",
  review_received: "text-amber-500",
  payout_settled: "text-emerald-600",
  reminder: "text-perch-primary-500",
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setItems(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // silent fail on poll
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  async function markAllRead() {
    setMarkingAll(true)
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      if (res.ok) {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } finally {
      setMarkingAll(false)
    }
  }

  async function markOneRead(id: string) {
    const res = await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    })
    if (res.ok) {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative rounded-lg p-2 transition-colors",
          "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-stone-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-80 sm:w-96",
              "rounded-xl border border-border bg-white shadow-lg dark:bg-stone-900"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingAll}
                  className="flex items-center gap-1 text-xs font-medium text-perch-primary-600 hover:text-perch-primary-500 disabled:opacity-50 dark:text-perch-primary-400"
                >
                  <Check className="size-3" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto size-8 text-neutral-300 dark:text-neutral-600" />
                  <p className="mt-2 text-sm text-neutral-500">
                    No notifications yet
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const Icon = typeIcons[item.type] ?? Bell
                  const color = typeColors[item.type] ?? "text-neutral-500"

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (!item.isRead) markOneRead(item.id)
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-stone-800",
                        !item.isRead && "bg-perch-primary-50/50 dark:bg-perch-primary-950/20"
                      )}
                    >
                      <div className={cn("mt-0.5 shrink-0", color)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm",
                              item.isRead
                                ? "text-neutral-600 dark:text-neutral-400"
                                : "font-medium text-foreground"
                            )}
                          >
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-perch-primary-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {item.content}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { NotificationBell }
