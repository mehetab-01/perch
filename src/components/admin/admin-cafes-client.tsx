"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Store,
  MapPin,
  Calendar,
  User,
  Mail,
  FileText,
  ExternalLink,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import type { AdminCafe } from "@/types/admin"

type Tab = "pending" | "verified" | "rejected" | "all"

type AdminCafesClientProps = {
  pending: AdminCafe[]
  verified: AdminCafe[]
  rejected: AdminCafe[]
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

function AdminCafesClient({ pending, verified, rejected }: AdminCafesClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("pending")
  const [selectedCafe, setSelectedCafe] = useState<AdminCafe | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const all = [...pending, ...verified, ...rejected].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pending.length },
    { key: "verified", label: "Verified", count: verified.length },
    { key: "rejected", label: "Rejected", count: rejected.length },
    { key: "all", label: "All", count: all.length },
  ]

  const displayCafes =
    tab === "all" ? all : tab === "pending" ? pending : tab === "verified" ? verified : rejected

  async function handleVerify(cafeId: string, status: "verified" | "rejected") {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/cafes/${cafeId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reason: status === "rejected" ? rejectReason : undefined,
        }),
      })
      if (res.ok) {
        setSelectedCafe(null)
        setRejectReason("")
        router.refresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Cafe Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === t.key
                ? "border-foreground text-foreground"
                : "border-transparent text-neutral-500 hover:text-foreground"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-neutral-400">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Cafe list */}
      {displayCafes.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">No cafes found</p>
      ) : (
        <div className="space-y-2">
          {displayCafes.map((cafe) => (
            <div
              key={cafe.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 dark:bg-stone-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{cafe.name}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", statusBadge[cafe.verificationStatus])}>
                    {cafe.verificationStatus}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {cafe.ownerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {cafe.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {cafe.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <LayoutGrid className="size-3" />
                    {cafe.spaceCount} space{cafe.spaceCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCafe(cafe)
                  setRejectReason("")
                }}
              >
                Review
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {selectedCafe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-white shadow-xl dark:bg-stone-900 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">Review Cafe</h2>
              <button
                onClick={() => setSelectedCafe(null)}
                className="rounded-lg p-1 text-neutral-400 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {/* Cafe info */}
              <div>
                <h3 className="font-semibold text-foreground">{selectedCafe.name}</h3>
                <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", statusBadge[selectedCafe.verificationStatus])}>
                  {selectedCafe.verificationStatus}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                  <span className="text-foreground">{selectedCafe.address}, {selectedCafe.city}</span>
                </div>
                {selectedCafe.description && (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                    <span className="text-neutral-600 dark:text-neutral-400">{selectedCafe.description}</span>
                  </div>
                )}
              </div>

              {/* Owner */}
              <div className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-medium uppercase text-neutral-400">Owner</p>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-foreground">
                    <User className="size-3.5 text-neutral-400" />
                    {selectedCafe.ownerName}
                  </p>
                  <p className="flex items-center gap-2 text-foreground">
                    <Mail className="size-3.5 text-neutral-400" />
                    {selectedCafe.ownerEmail}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-medium uppercase text-neutral-400">Documents</p>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">
                    <span className="text-neutral-500">GST:</span>{" "}
                    {selectedCafe.gstNumber || <span className="text-neutral-400 italic">Not provided</span>}
                  </p>
                  <p className="text-foreground">
                    <span className="text-neutral-500">FSSAI:</span>{" "}
                    {selectedCafe.fssaiLicenseUrl ? (
                      <a
                        href={selectedCafe.fssaiLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-perch-primary-600 hover:underline dark:text-perch-primary-400"
                      >
                        View document <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span className="text-neutral-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Spaces */}
              <div className="rounded-lg border border-border p-3">
                <p className="mb-1 text-xs font-medium uppercase text-neutral-400">Spaces</p>
                <p className="text-sm text-foreground">
                  {selectedCafe.spaceCount} space{selectedCafe.spaceCount !== 1 ? "s" : ""} listed
                </p>
              </div>

              {/* Actions */}
              {selectedCafe.verificationStatus === "pending" && (
                <div className="space-y-3 border-t border-border pt-4">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (required if rejecting)"
                    className="w-full rounded-lg border border-border bg-transparent p-3 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring dark:border-stone-700"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleVerify(selectedCafe.id, "verified")}
                      disabled={submitting}
                    >
                      <CheckCircle2 className="size-4" />
                      {submitting ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerify(selectedCafe.id, "rejected")}
                      disabled={submitting || !rejectReason.trim()}
                    >
                      <XCircle className="size-4" />
                      {submitting ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { AdminCafesClient }
