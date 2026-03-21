"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  FileText,
  Users,
  Clock,
  Check,
  Pencil,
  PartyPopper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OnboardingState } from "@/components/onboarding/types"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type StepReviewProps = {
  state: OnboardingState
  onGoToStep: (step: number) => void
  onBack: () => void
}

function StepReview({ state, onGoToStep, onBack }: StepReviewProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!state.cafeId) return
    setSubmitting(true)

    const res = await fetch(`/api/cafes/${state.cafeId}/submit`, {
      method: "POST",
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? "Failed to submit")
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-12 text-center"
      >
        <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-perch-secondary-50 dark:bg-perch-secondary-950/30">
          <PartyPopper className="size-10 text-perch-secondary-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          You&apos;re all set!
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks for listing <strong>{state.name}</strong> on Perch! We&apos;ll
          review your cafe within 24 hours. You&apos;ll get an email when
          you&apos;re approved and bookings start flowing in.
        </p>
        <a
          href="/cafe-dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-perch-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-perch-primary-600"
        >
          Go to dashboard
        </a>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Review everything before submitting. Click the edit icon on any section to make changes.
      </p>

      {/* Cafe details */}
      <SectionCard
        title="Cafe details"
        step={0}
        onEdit={onGoToStep}
      >
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">{state.name}</p>
          {state.description && (
            <p className="text-muted-foreground">{state.description}</p>
          )}
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5" />
            {state.address}, {state.city}
          </p>
          <p className="text-xs text-muted-foreground">
            Lat: {state.latitude.toFixed(4)}, Lng: {state.longitude.toFixed(4)}
          </p>
        </div>
      </SectionCard>

      {/* Documents */}
      <SectionCard
        title="Verification documents"
        step={1}
        onEdit={onGoToStep}
      >
        <div className="space-y-1.5 text-sm">
          {state.gstNumber ? (
            <p className="flex items-center gap-1.5 text-foreground">
              <Check className="size-3.5 text-perch-secondary-500" />
              GST: {state.gstNumber}
            </p>
          ) : (
            <p className="text-muted-foreground">No GST number provided</p>
          )}
          {state.fssaiLicenseNumber ? (
            <p className="flex items-center gap-1.5 text-foreground">
              <Check className="size-3.5 text-perch-secondary-500" />
              FSSAI: {state.fssaiLicenseNumber}
            </p>
          ) : (
            <p className="text-muted-foreground">No FSSAI number provided</p>
          )}
          {state.fssaiLicenseUrl ? (
            <p className="flex items-center gap-1.5 text-foreground">
              <FileText className="size-3.5 text-perch-secondary-500" />
              License document uploaded
            </p>
          ) : (
            <p className="text-muted-foreground">No document uploaded</p>
          )}
        </div>
      </SectionCard>

      {/* Spaces */}
      <SectionCard
        title={`Spaces (${state.spaces.length})`}
        step={2}
        onEdit={onGoToStep}
      >
        <div className="space-y-3">
          {state.spaces.map((space) => (
            <div
              key={space.id ?? space.name}
              className="rounded-lg border border-border p-3 dark:border-stone-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{space.name}</span>
                <span className="text-sm font-semibold text-foreground">
                  ₹{space.pricePerHour}/hr
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3" />
                {space.capacityMin}-{space.capacityMax} people
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
          ))}
        </div>
      </SectionCard>

      {/* Availability */}
      <SectionCard
        title="Availability"
        step={3}
        onEdit={onGoToStep}
      >
        <div className="space-y-2 text-sm">
          {state.availability.map((avail) => (
            <div key={avail.spaceId} className="flex items-start gap-2">
              <Clock className="mt-0.5 size-3.5 text-muted-foreground" />
              <div>
                <span className="font-medium text-foreground">{avail.spaceName}:</span>{" "}
                <span className="text-muted-foreground">
                  {avail.slots
                    .map((s) => DAY_NAMES[s.dayOfWeek])
                    .join(", ")}{" "}
                  {avail.slots[0]?.startTime}–{avail.slots[0]?.endTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit for verification"}
        </Button>
      </div>
    </div>
  )
}

/* ── Section card ── */

type SectionCardProps = {
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}

function SectionCard({ title, step, onEdit, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 dark:bg-perch-dark/80 dark:border-stone-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-perch-primary-600 hover:bg-perch-primary-50 dark:text-perch-primary-400 dark:hover:bg-perch-primary-950/30"
          aria-label={`Edit ${title}`}
        >
          <Pencil className="size-3" />
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

export { StepReview }
