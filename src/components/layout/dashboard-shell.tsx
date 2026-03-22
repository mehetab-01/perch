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
import { NotificationBell } from "@/components/layout/notification-bell"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Search", href: "/search", icon: Search },
]

const bottomTabLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Search", href: "/search", icon: Search },
  { label: "Profile", href: "/profile", icon: User },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#0C0A09]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/8 bg-[#111110] lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-white/8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight font-display text-white"
          >
            perch
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1" aria-label="Dashboard navigation">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                  isActive
                    ? "bg-perch-primary-500/15 text-perch-primary-400 border border-perch-primary-500/20"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100 border border-transparent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="h-4.5 w-4.5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom account */}
        <div className="border-t border-white/8 p-4">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-9 w-9" },
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-200">Account</p>
              <p className="text-xs text-neutral-500 truncate">Settings & profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-16 lg:pb-0 lg:pl-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-[#0C0A09]/80 px-4 backdrop-blur-xl lg:px-8">
          {/* Mobile logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight font-display text-white lg:hidden"
          >
            perch
          </Link>

          {/* Desktop page title */}
          <h1 className="text-sm font-semibold text-neutral-400 max-lg:hidden tracking-wide uppercase">
            {bottomTabLinks.find((l) =>
              l.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(l.href)
            )?.label ?? "Dashboard"}
          </h1>

          <div className="flex items-center gap-1">
            <NotificationBell />
            <Link
              href="/profile"
              aria-label="Profile"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                pathname.startsWith("/profile")
                  ? "bg-perch-primary-500/15 text-perch-primary-400"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
              )}
            >
              <User className="h-5 w-5" />
            </Link>
            <div className="lg:hidden ml-1">
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-8 w-8" },
                }}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#111110]/95 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around py-2">
          {bottomTabLinks.map((link) => {
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
                    ? "text-perch-primary-400"
                    : "text-neutral-600 hover:text-neutral-400"
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
