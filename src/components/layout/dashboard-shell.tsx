"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  CalendarDays,
  Search,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Search", href: "/search", icon: Search },
  { label: "Profile", href: "/profile", icon: User },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-perch-dark">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-white dark:bg-stone-900 lg:block">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight font-display text-foreground"
          >
            perch
          </Link>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Dashboard navigation">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
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
      <main className="flex-1 pb-16 lg:pb-0 lg:pl-64">
        {/* Top bar (mobile + desktop) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-lg dark:bg-stone-900/80 lg:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight font-display text-foreground lg:hidden"
          >
            perch
          </Link>
          <h1 className="text-lg font-semibold text-foreground max-lg:sr-only">
            {sidebarLinks.find((l) =>
              l.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(l.href)
            )?.label ?? "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
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
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
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
