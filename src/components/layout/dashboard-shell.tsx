"use client"

import { useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { NotificationBell } from "@/components/layout/notification-bell"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Search", href: "/dashboard?tab=search", icon: Search },
  { label: "Profile", href: "/profile", icon: User },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeLink = sidebarLinks.find((l) => {
    if (l.href === "/dashboard?tab=search") return pathname === "/dashboard" && searchParams.get("tab") === "search"
    if (l.href === "/dashboard") return pathname === "/dashboard" && searchParams.get("tab") !== "search"
    return pathname.startsWith(l.href)
  })

  return (
    <div className="flex min-h-screen bg-[#0C0A09]">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/8 bg-[#111110] transition-all duration-300",
          // desktop
          collapsed ? "lg:w-[68px]" : "lg:w-64",
          // mobile: slide in/out
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo row */}
        <div className={cn(
          "flex h-16 items-center border-b border-white/8 px-4",
          collapsed ? "lg:justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link
              href="/"
              className="text-xl font-bold tracking-tight font-display text-white"
            >
              perch
            </Link>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-white/8 hover:text-neutral-200"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-200"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-2 py-4 flex-1" aria-label="Dashboard navigation">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard?tab=search"
                ? pathname === "/dashboard" && searchParams.get("tab") === "search"
                : link.href === "/dashboard"
                ? pathname === "/dashboard" && searchParams.get("tab") !== "search"
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                  collapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-perch-primary-500/15 text-perch-primary-400 border border-perch-primary-500/20"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100 border border-transparent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {(!collapsed) && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom account */}
        <div className={cn("border-t border-white/8 p-3", collapsed && "lg:flex lg:justify-center")}>
          <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
            <UserButton
              appearance={{ elements: { avatarBox: "h-9 w-9" } }}
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-200">Account</p>
                <p className="text-xs text-neutral-500 truncate">Settings & profile</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen pb-16 lg:pb-0 transition-all duration-300",
          collapsed ? "lg:pl-[68px]" : "lg:pl-64"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-[#0C0A09]/90 px-4 backdrop-blur-xl lg:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/8 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <span className="text-sm font-semibold text-neutral-300 tracking-wide max-lg:hidden">
            {activeLink?.label ?? "Dashboard"}
          </span>

          {/* Mobile: perch wordmark */}
          <Link
            href="/"
            className="text-lg font-bold font-display text-white lg:hidden"
          >
            perch
          </Link>

          {/* Right actions */}
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
                  : "text-neutral-400 hover:bg-white/8 hover:text-neutral-200"
              )}
            >
              <User className="h-5 w-5" />
            </Link>
            <div className="lg:hidden ml-1">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#111110]/95 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around py-2">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === "/dashboard?tab=search"
                ? pathname === "/dashboard" && searchParams.get("tab") === "search"
                : link.href === "/dashboard"
                ? pathname === "/dashboard" && searchParams.get("tab") !== "search"
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
