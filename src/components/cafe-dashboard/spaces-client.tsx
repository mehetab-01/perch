"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  IndianRupee,
  X,
  Loader2,
  ImageOff,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { formatPaise } from "@/lib/utils/format"
import type { Space } from "@/lib/db/schema"

type SpacesClientProps = {
  cafeId: string
  initialSpaces: Space[]
}

function CafeSpacesClient({ cafeId, initialSpaces }: SpacesClientProps) {
  const [spaces, setSpaces] = useState(initialSpaces)
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleToggle = useCallback(
    async (space: Space) => {
      setTogglingId(space.id)
      try {
        const res = await fetch(`/api/spaces/${space.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !space.isActive }),
        })

        if (!res.ok) throw new Error("Failed to update")

        setSpaces((prev) =>
          prev.map((s) =>
            s.id === space.id ? { ...s, isActive: !s.isActive } : s
          )
        )
        toast(
          `${space.name} ${space.isActive ? "deactivated" : "activated"}`,
          "success"
        )
      } catch {
        toast("Failed to update space", "error")
      } finally {
        setTogglingId(null)
      }
    },
    [toast]
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/spaces/${deleteTarget.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")

      setSpaces((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      toast(`${deleteTarget.name} deleted`, "success")
      setDeleteTarget(null)
    } catch {
      toast("Failed to delete space", "error")
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Spaces</h1>
        <Button
          onClick={() => {
            window.location.href = `/onboarding?step=spaces&cafeId=${cafeId}`
          }}
        >
          <Plus className="size-4" />
          Add space
        </Button>
      </div>

      {spaces.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <ImageOff className="size-12 text-neutral-300 dark:text-neutral-600" />
          <p className="text-neutral-500 dark:text-neutral-400">
            No spaces yet. Add your first space to start receiving bookings.
          </p>
          <Button
            onClick={() => {
              window.location.href = `/onboarding?step=spaces&cafeId=${cafeId}`
            }}
          >
            <Plus className="size-4" />
            Add your first space
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden">
              {/* Photo */}
              <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-stone-800">
                {space.photos[0] ? (
                  <Image
                    src={space.photos[0]}
                    alt={space.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="size-8 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                {/* Active/Inactive badge */}
                <div className="absolute right-2 top-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm",
                      space.isActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-neutral-500/90 text-white"
                    )}
                  >
                    {space.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{space.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {space.capacityMin}–{space.capacityMax}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="size-3.5" />
                    {formatPaise(space.pricePerHour)}/hr
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(space)}
                    disabled={togglingId === space.id}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400 focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      space.isActive
                        ? "bg-emerald-500"
                        : "bg-neutral-300 dark:bg-stone-600"
                    )}
                    role="switch"
                    aria-checked={space.isActive}
                    aria-label={`Toggle ${space.name} ${space.isActive ? "off" : "on"}`}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
                        space.isActive ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>

                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/onboarding?step=spaces&cafeId=${cafeId}&editSpace=${space.id}`
                      }}
                      aria-label={`Edit ${space.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(space)}
                      aria-label={`Delete ${space.name}`}
                      className="text-red-500 hover:text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl dark:bg-stone-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-foreground">
                Delete space
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {deleteTarget.name}
                </span>
                ? This action cannot be undone. Any existing bookings for this
                space will also be affected.
              </p>

              <div className="mt-5 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { CafeSpacesClient }
