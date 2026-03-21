"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Store,
  Users,
  CalendarDays,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { NotificationBell } from "@/components/layout/notification-bell"

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Cafes", href: "/admin/cafes", icon: Store, exact: false },
  { label: "Users", href: "/admin/users", icon: Users, exact: false },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays, exact: false },
]

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-perch-dark">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-border bg-white dark:bg-stone-900 lg:block">
        <div className="border-b border-border px-5 py-4">
          <Link
            href="/admin"
            className="text-xl font-bold tracking-tight font-display text-foreground"
          >
            perch
          </Link>
          <span className="ml-2 inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:bg-red-950 dark:text-red-400">
            <Shield className="size-3" />
            Admin
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-3" aria-label="Admin navigation">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-100 text-foreground dark:bg-stone-800"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-foreground dark:text-neutral-400 dark:hover:bg-stone-800/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <div className="flex items-center gap-2">
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Admin</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-lg dark:bg-stone-900/80 lg:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-lg font-bold tracking-tight font-display text-foreground lg:hidden"
            >
              perch
            </Link>
            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:bg-red-950 dark:text-red-400 lg:hidden">
              <Shield className="size-3" />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="lg:hidden">
              <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-4 py-2 dark:bg-stone-900 lg:hidden">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-neutral-100 text-foreground dark:bg-stone-800"
                    : "text-neutral-500 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export { AdminShell }
