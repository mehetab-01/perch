"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { OnboardingState, SpaceAvailability, AvailabilitySlot } from "@/components/onboarding/types"

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
]

type StepAvailabilityProps = {
  state: OnboardingState
  onNext: (data: Partial<OnboardingState>) => void
  onBack: () => void
}

function StepAvailability({ state, onNext, onBack }: StepAvailabilityProps) {
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, { days: Set<number>; startTime: string; endTime: string; sameEveryDay: boolean }>
  >(() => {
    const init: Record<string, { days: Set<number>; startTime: string; endTime: string; sameEveryDay: boolean }> = {}
    for (const space of state.spaces) {
      const existing = state.availability.find((a) => a.spaceId === space.id)
      if (existing && existing.slots.length > 0) {
        init[space.id ?? space.name] = {
          days: new Set(existing.slots.map((s) => s.dayOfWeek)),
          startTime: existing.slots[0]?.startTime ?? "09:00",
          endTime: existing.slots[0]?.endTime ?? "18:00",
          sameEveryDay: true,
        }
      } else {
        init[space.id ?? space.name] = {
          days: new Set([1, 2, 3, 4, 5]), // Mon-Fri default
          startTime: "09:00",
          endTime: "18:00",
          sameEveryDay: true,
        }
      }
    }
    return init
  })

  const [saving, setSaving] = useState(false)

  const toggleDay = (spaceKey: string, day: number) => {
    setAvailabilityMap((prev) => {
      const entry = prev[spaceKey]!
      const newDays = new Set(entry.days)
      if (newDays.has(day)) {
        newDays.delete(day)
      } else {
        newDays.add(day)
      }
      return { ...prev, [spaceKey]: { ...entry, days: newDays } }
    })
  }

  const updateTime = (spaceKey: string, field: "startTime" | "endTime", value: string) => {
    setAvailabilityMap((prev) => ({
      ...prev,
      [spaceKey]: { ...prev[spaceKey]!, [field]: value },
    }))
  }

  const handleContinue = async () => {
    setSaving(true)

    const allAvailability: SpaceAvailability[] = []

    for (const space of state.spaces) {
      const key = space.id ?? space.name
      const entry = availabilityMap[key]
      if (!entry || !space.id) continue

      const slots: AvailabilitySlot[] = [...entry.days].map((day) => ({
        dayOfWeek: day,
        startTime: entry.startTime,
        endTime: entry.endTime,
      }))

      // Save to API
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId: space.id, slots }),
      })

      if (!res.ok) {
        alert(`Failed to save availability for ${space.name}`)
        setSaving(false)
        return
      }

      allAvailability.push({
        spaceId: space.id,
        spaceName: space.name,
        slots,
      })
    }

    setSaving(false)
    onNext({ availability: allAvailability })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Set when each space is available for bookings. You can always change this later.
      </p>

      {state.spaces.map((space, i) => {
        const key = space.id ?? space.name
        const entry = availabilityMap[key]!

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-white p-5 dark:bg-perch-dark/80 dark:border-stone-800"
          >
            <h4 className="mb-3 font-semibold text-foreground">{space.name}</h4>

            {/* Day toggles */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-muted-foreground">
                Available days
              </label>
              <div className="flex gap-1.5">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(key, day.value)}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-center text-xs font-medium transition-colors",
                      entry.days.has(day.value)
                        ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
                        : "border-border text-muted-foreground hover:border-perch-primary-300"
                    )}
                    aria-pressed={entry.days.has(day.value)}
                    aria-label={`${day.label} ${entry.days.has(day.value) ? "selected" : "not selected"}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  Opens at
                </label>
                <input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) => updateTime(key, "startTime", e.target.value)}
                  step={1800}
                  className={cn(
                    "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  aria-label={`${space.name} opening time`}
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  Closes at
                </label>
                <input
                  type="time"
                  value={entry.endTime}
                  onChange={(e) => updateTime(key, "endTime", e.target.value)}
                  step={1800}
                  className={cn(
                    "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  aria-label={`${space.name} closing time`}
                />
              </div>
            </div>
          </motion.div>
        )
      })}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={handleContinue}
          disabled={saving}
        >
          {saving ? "Saving..." : "Continue to review"}
        </Button>
      </div>
    </div>
  )
}

export { StepAvailability }
