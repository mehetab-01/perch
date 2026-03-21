"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Calendar,
  Store,
  CalendarDays,
  Search,
  Shield,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import type { AdminUser } from "@/types/admin"

type RoleFilter = "all" | "worker" | "cafe_owner" | "admin"

const roleBadge: Record<string, string> = {
  worker: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  cafe_owner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  admin: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const roleLabel: Record<string, string> = {
  worker: "Worker",
  cafe_owner: "Cafe Owner",
  admin: "Admin",
}

function AdminUsersClient({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<RoleFilter>("all")
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const filtered = users.filter((u) => {
    const matchesRole = filter === "all" || u.role === filter
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  const roleCounts = {
    all: users.length,
    worker: users.filter((u) => u.role === "worker").length,
    cafe_owner: users.filter((u) => u.role === "cafe_owner").length,
    admin: users.filter((u) => u.role === "admin").length,
  }

  const tabs: { key: RoleFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "worker", label: "Workers" },
    { key: "cafe_owner", label: "Cafe Owners" },
    { key: "admin", label: "Admins" },
  ]

  async function handleRoleChange() {
    if (!selectedUser || !newRole || newRole === selectedUser.role) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setSelectedUser(null)
        setNewRole("")
        router.refresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">User Management</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring dark:bg-stone-900 dark:border-stone-700"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              filter === t.key
                ? "border-foreground text-foreground"
                : "border-transparent text-neutral-500 hover:text-foreground"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-neutral-400">
              ({roleCounts[t.key]})
            </span>
          </button>
        ))}
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">
          No users found
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 dark:bg-stone-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      roleBadge[user.role]
                    )}
                  >
                    {roleLabel[user.role]}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {user.createdAt.toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {user.bookingCount} booking
                    {user.bookingCount !== 1 ? "s" : ""}
                  </span>
                  {user.cafeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Store className="size-3" />
                      {user.cafeCount} cafe{user.cafeCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setNewRole(user.role)
                }}
              >
                Manage
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Role change modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-white shadow-xl dark:bg-stone-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Manage User
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-neutral-400 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {/* User info */}
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedUser.name}
                </h3>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {selectedUser.email}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                    roleBadge[selectedUser.role]
                  )}
                >
                  {roleLabel[selectedUser.role]}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {selectedUser.bookingCount}
                  </p>
                  <p className="text-xs text-neutral-500">Bookings</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {selectedUser.cafeCount}
                  </p>
                  <p className="text-xs text-neutral-500">Cafes</p>
                </div>
              </div>

              {/* Role change */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-sm font-medium text-foreground">
                  Change Role
                </label>
                <div className="flex gap-2">
                  {(["worker", "cafe_owner", "admin"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        newRole === role
                          ? "border-foreground bg-foreground text-white dark:text-black"
                          : "border-border text-neutral-500 hover:border-neutral-300"
                      )}
                    >
                      {roleLabel[role]}
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={handleRoleChange}
                  disabled={
                    submitting || newRole === selectedUser.role
                  }
                >
                  <Shield className="size-4" />
                  {submitting ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { AdminUsersClient }
