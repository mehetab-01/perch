"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import { spaceSchema, type SpaceInput } from "@/lib/validators/space"
import { UploadButton } from "@/lib/uploadthing"
import type { OnboardingState, OnboardingSpace } from "@/components/onboarding/types"

const AMENITY_OPTIONS = [
  "WiFi", "Projector", "Whiteboard", "Power Outlets", "AC", "Parking", "Beverages",
] as const

const NOISE_OPTIONS = [
  { value: "quiet" as const, label: "Quiet", desc: "Best for focused work" },
  { value: "moderate" as const, label: "Moderate", desc: "Good for meetings" },
  { value: "lively" as const, label: "Lively", desc: "Cafe buzz energy" },
]

type StepAddSpacesProps = {
  state: OnboardingState
  onNext: (data: Partial<OnboardingState>) => void
  onBack: () => void
}

function StepAddSpaces({ state, onNext, onBack }: StepAddSpacesProps) {
  const [spaces, setSpaces] = useState<OnboardingSpace[]>(state.spaces)
  const [editing, setEditing] = useState<number | null>(null) // index or null
  const [showForm, setShowForm] = useState(spaces.length === 0)

  const handleSaveSpace = async (space: OnboardingSpace, editIndex: number | null) => {
    if (!state.cafeId) return

    if (editIndex !== null && space.id) {
      // Update existing space
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(space),
      })
      if (!res.ok) {
        alert("Failed to update space")
        return
      }
      const result = await res.json()
      const updated = [...spaces]
      updated[editIndex] = { ...space, id: result.space.id }
      setSpaces(updated)
    } else {
      // Create new space
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...space, cafeId: state.cafeId }),
      })
      if (!res.ok) {
        alert("Failed to create space")
        return
      }
      const result = await res.json()
      setSpaces([...spaces, { ...space, id: result.space.id }])
    }

    setShowForm(false)
    setEditing(null)
  }

  const handleDeleteSpace = async (index: number) => {
    const space = spaces[index]
    if (space?.id) {
      const res = await fetch(`/api/spaces/${space.id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("Failed to delete space")
        return
      }
    }
    setSpaces(spaces.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    if (spaces.length === 0) {
      alert("Please add at least one space")
      return
    }
    onNext({ spaces })
  }

  return (
    <div className="space-y-5">
      {/* Existing spaces */}
      <AnimatePresence>
        {spaces.map((space, i) => (
          <motion.div
            key={space.id ?? i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-border bg-white p-4 dark:bg-perch-dark/80 dark:border-stone-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-foreground">{space.name}</h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <Users className="mr-1 inline size-3.5" />
                  {space.capacityMin}-{space.capacityMax} people &middot; ₹{space.pricePerHour}/hr
                </p>
                {space.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {space.amenities.map((a) => (
                      <Badge key={a} variant="amenity" className="text-[10px]">
                        {a}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditing(i); setShowForm(true) }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${space.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => handleDeleteSpace(i)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${space.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add space form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <SpaceForm
              cafeId={state.cafeId!}
              initial={editing !== null ? spaces[editing] : undefined}
              onSave={(space) => handleSaveSpace(space, editing)}
              onCancel={() => { setShowForm(false); setEditing(null) }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm font-medium text-muted-foreground transition-colors hover:border-perch-primary-400 hover:text-perch-primary-600 dark:hover:border-perch-primary-600 dark:hover:text-perch-primary-400"
          aria-label="Add a new space"
        >
          <Plus className="size-5" />
          Add a space
        </button>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={handleContinue}
          disabled={spaces.length === 0}
        >
          Continue ({spaces.length} {spaces.length === 1 ? "space" : "spaces"})
        </Button>
      </div>
    </div>
  )
}

/* ── Space form ── */

type SpaceFormProps = {
  cafeId: string
  initial?: OnboardingSpace
  onSave: (space: OnboardingSpace) => void
  onCancel: () => void
}

function SpaceForm({ cafeId, initial, onSave, onCancel }: SpaceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SpaceInput>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      cafeId,
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      capacityMin: initial?.capacityMin ?? 1,
      capacityMax: initial?.capacityMax ?? 4,
      pricePerHour: initial?.pricePerHour ?? 300,
      noiseLevel: initial?.noiseLevel ?? "moderate",
      amenities: initial?.amenities ?? [],
      photos: initial?.photos ?? [],
    },
  })

  const amenities = watch("amenities")
  const noiseLevel = watch("noiseLevel")
  const photos = watch("photos")

  const toggleAmenity = (amenity: string) => {
    const current = new Set(amenities)
    if (current.has(amenity)) {
      current.delete(amenity)
    } else {
      current.add(amenity)
    }
    setValue("amenities", [...current])
  }

  const onSubmit = (data: SpaceInput) => {
    onSave({
      id: initial?.id,
      name: data.name,
      description: data.description,
      capacityMin: data.capacityMin,
      capacityMax: data.capacityMax,
      pricePerHour: data.pricePerHour,
      noiseLevel: data.noiseLevel,
      amenities: data.amenities,
      photos: data.photos,
    })
  }

  return (
    <div className="rounded-xl border border-perch-primary-200 bg-perch-primary-50/30 p-5 dark:border-perch-primary-800 dark:bg-perch-primary-950/20">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-display text-base font-semibold text-foreground">
          {initial ? "Edit space" : "New space"}
        </h4>
        <button
          onClick={onCancel}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Cancel"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="space-name" className="mb-1 block text-sm font-medium text-foreground">
            Space name *
          </label>
          <Input
            id="space-name"
            placeholder="e.g., Corner Booth, Private Room"
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="space-desc" className="mb-1 block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="space-desc"
            rows={2}
            maxLength={300}
            placeholder="A cozy corner booth perfect for 1-on-1 meetings..."
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cap-min" className="mb-1 block text-sm font-medium text-foreground">
              Min people *
            </label>
            <Input
              id="cap-min"
              type="number"
              min={1}
              error={!!errors.capacityMin}
              {...register("capacityMin", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label htmlFor="cap-max" className="mb-1 block text-sm font-medium text-foreground">
              Max people *
            </label>
            <Input
              id="cap-max"
              type="number"
              min={1}
              error={!!errors.capacityMax}
              {...register("capacityMax", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-foreground">
            Price per hour (₹) *
          </label>
          <Input
            id="price"
            type="number"
            min={1}
            placeholder="300"
            error={!!errors.pricePerHour}
            {...register("pricePerHour", { valueAsNumber: true })}
          />
          {errors.pricePerHour && <p className="mt-1 text-xs text-destructive">{errors.pricePerHour.message}</p>}
        </div>

        {/* Noise level */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Noise level</label>
          <div className="flex gap-2">
            {NOISE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("noiseLevel", opt.value)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-center text-sm transition-colors",
                  noiseLevel === opt.value
                    ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
                    : "border-border text-muted-foreground hover:border-perch-primary-300"
                )}
                aria-pressed={noiseLevel === opt.value}
                aria-label={`${opt.label}: ${opt.desc}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const active = amenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
                      : "border-border text-muted-foreground hover:border-perch-primary-300"
                  )}
                  aria-pressed={active}
                >
                  {amenity}
                </button>
              )
            })}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Photos (up to 5)
          </label>
          {photos.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div key={url} className="relative size-20 overflow-hidden rounded-lg">
                  <Image src={url} alt={`Space photo ${i + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => setValue("photos", photos.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < 5 && (
            <UploadButton
              endpoint="spacePhotos"
              onClientUploadComplete={(res) => {
                if (res) {
                  const newPhotos = res.map((r) => r.ufsUrl)
                  setValue("photos", [...photos, ...newPhotos].slice(0, 5))
                }
              }}
              onUploadError={(err) => alert(`Upload failed: ${err.message}`)}
            />
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initial ? "Update space" : "Add space"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export { StepAddSpaces }
