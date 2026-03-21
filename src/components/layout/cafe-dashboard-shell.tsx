"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  CalendarDays,
  LayoutGrid,
  IndianRupee,
  Star,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Badge } from "@/components/ui/badge"
import { NotificationBell } from "@/components/layout/notification-bell"

type VerificationStatus = "pending" | "verified" | "rejected"

type CafeDashboardShellProps = {
  cafeName: string
  verificationStatus: VerificationStatus
  children: React.ReactNode
}

const sidebarLinks = [
  { label: "Overview", href: "/cafe-dashboard", icon: LayoutDashboard, exact: true },
  { label: "Bookings", href: "/cafe-dashboard/bookings", icon: CalendarDays, exact: false },
  { label: "Spaces", href: "/cafe-dashboard/spaces", icon: LayoutGrid, exact: false },
  { label: "Earnings", href: "/cafe-dashboard/earnings", icon: IndianRupee, exact: false },
  { label: "Reviews", href: "/cafe-dashboard/reviews", icon: Star, exact: false },
  { label: "Settings", href: "/cafe-dashboard/settings", icon: Settings, exact: false },
]

// Mobile shows 5 tabs — Settings lives only in sidebar
const mobileLinks = sidebarLinks.filter((l) => l.label !== "Settings")

const verificationConfig: Record<
  VerificationStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
}

function CafeDashboardShell({
  cafeName,
  verificationStatus,
  children,
}: CafeDashboardShellProps) {
  const pathname = usePathname()
  const vConfig = verificationConfig[verificationStatus]
  const VIcon = vConfig.icon

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-perch-dark">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-white dark:bg-stone-900 lg:block">
        {/* Cafe header */}
        <div className="border-b border-border px-6 py-5">
          <Link
            href="/cafe-dashboard"
            className="text-xl font-bold tracking-tight font-display text-foreground"
          >
            perch
          </Link>
          <div className="mt-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {cafeName}
            </p>
            <span
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                vConfig.className
              )}
            >
              <VIcon className="size-3" />
              {vConfig.label}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Cafe dashboard navigation">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                  isActive
                    ? "bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950 dark:text-perch-primary-400"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-stone-800 dark:hover:text-neutral-200"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-9 w-9" },
              }}
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Account
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-lg dark:bg-stone-900/80 lg:px-8">
          <Link
            href="/cafe-dashboard"
            className="text-lg font-bold tracking-tight font-display text-foreground lg:hidden"
          >
            perch
          </Link>
          <h1 className="text-lg font-semibold text-foreground max-lg:sr-only">
            {sidebarLinks.find((l) =>
              l.exact ? pathname === l.href : pathname.startsWith(l.href)
            )?.label ?? "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            {/* Settings icon on mobile */}
            <Link
              href="/cafe-dashboard/settings"
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-stone-800 lg:hidden"
              aria-label="Settings"
            >
              <Settings className="size-5" />
            </Link>
            <div className="lg:hidden">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-8 w-8" },
                }}
              />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/90 backdrop-blur-lg dark:bg-stone-900/90 lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around py-2">
          {mobileLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                  isActive
                    ? "text-perch-primary-600 dark:text-perch-primary-400"
                    : "text-neutral-500 dark:text-neutral-500"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export { CafeDashboardShell }
export type { CafeDashboardShellProps }
