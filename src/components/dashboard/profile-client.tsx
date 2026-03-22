"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Repeat,
  Calendar,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatTime, formatDateMedium, formatPaise } from "@/lib/utils/format"
import type { BookingWithDetails } from "@/types/dashboard"

type ProfileUser = {
  name: string
  email: string
  phone: string | null
  companyName: string | null
  avatarUrl: string | null
  role: "worker" | "cafe_owner" | "admin"
  memberSince: Date
}

type Props = {
  user: ProfileUser
  bookings: BookingWithDetails[]
}

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  checked_in: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed: "bg-neutral-100 text-neutral-600 dark:bg-stone-800 dark:text-neutral-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const historyTabs = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "upcoming", label: "Upcoming" },
  { key: "cancelled", label: "Cancelled" },
] as const

type TabKey = (typeof historyTabs)[number]["key"]

export function ProfileClient({ user, bookings }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("all")

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return b.status === "completed"
    if (activeTab === "upcoming") return b.status === "confirmed" || b.status === "pending" || b.status === "checked_in"
    if (activeTab === "cancelled") return b.status === "cancelled"
    return true
  })

  const memberSinceFormatted = user.memberSince.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-white p-6 dark:bg-stone-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-perch-primary-100 dark:ring-perch-primary-900"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-perch-primary-100 text-perch-primary-700 dark:bg-perch-primary-950 dark:text-perch-primary-400">
                <User className="h-9 w-9" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-perch-primary-50 px-2.5 py-0.5 text-xs font-medium text-perch-primary-700 dark:bg-perch-primary-950 dark:text-perch-primary-400">
                  <Shield className="h-3 w-3" />
                  {user.role === "worker" ? "Professional" : user.role === "cafe_owner" ? "Cafe Owner" : "Admin"}
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="h-3 w-3" />
                  Member since {memberSinceFormatted}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user.companyName && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Building2 className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{user.companyName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Booking history */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-white p-6 dark:bg-stone-900"
      >
        <h2 className="mb-4 text-base font-semibold text-foreground">Booking History</h2>

        {/* Tabs */}
        <div
          className="mb-5 flex gap-1 rounded-lg border border-border bg-neutral-100 p-1 dark:bg-stone-800"
          role="tablist"
          aria-label="Filter bookings"
        >
          {historyTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                activeTab === tab.key
                  ? "bg-white text-foreground shadow-sm dark:bg-stone-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        <AnimatePresence mode="wait">
          {filteredBookings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No {activeTab === "all" ? "" : activeTab} bookings yet
              </p>
              {(activeTab === "all" || activeTab === "upcoming") && (
                <Link
                  href="/search"
                  className="mt-2 inline-block text-sm font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
                >
                  Find a space →
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-3"
            >
              {filteredBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-border bg-neutral-50 p-4 transition-colors",
                    "hover:border-perch-primary-200 hover:shadow-sm dark:bg-stone-800 dark:hover:border-perch-primary-800",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
                  )}
                >
                  {/* Date badge */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-perch-primary-50 dark:bg-perch-primary-950">
                    <span className="text-[10px] font-medium uppercase text-perch-primary-600 dark:text-perch-primary-400">
                      {new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                    <span className="text-base font-bold text-perch-primary-700 dark:text-perch-primary-300">
                      {new Date(booking.date + "T00:00:00").getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {booking.meetingTitle ?? booking.spaceName}
                      </h3>
                      {booking.isRecurring && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                          <Repeat className="size-3" />
                          Series
                        </span>
                      )}
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          statusColors[booking.status] ?? ""
                        )}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.cafeName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.numAttendees}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {formatPaise(booking.totalAmount)} · {formatDateMedium(booking.date)}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
