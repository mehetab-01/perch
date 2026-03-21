"use client"

import { motion } from "framer-motion"
import { Users, Volume2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import type { Space } from "@/lib/db/schema"

const noiseLabelMap: Record<string, { label: string; color: string }> = {
  quiet: { label: "Quiet", color: "bg-emerald-500" },
  moderate: { label: "Moderate", color: "bg-amber-500" },
  lively: { label: "Lively", color: "bg-rose-500" },
}

type CafeSpacesProps = {
  spaces: Space[]
  selectedSpaceId: string | null
  onSelectSpace: (spaceId: string) => void
}

function CafeSpaces({ spaces, selectedSpaceId, onSelectSpace }: CafeSpacesProps) {
  return (
    <section aria-label="Available spaces">
      <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
        Available spaces
      </h2>
      <div className="space-y-3">
        {spaces
          .filter((s) => s.isActive)
          .map((space, i) => {
            const isSelected = selectedSpaceId === space.id
            const noise = noiseLabelMap[space.noiseLevel] ?? noiseLabelMap.moderate!

            return (
              <motion.button
                key={space.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                onClick={() => onSelectSpace(space.id)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-perch-primary-500 bg-perch-primary-50 ring-2 ring-perch-primary-500/20 dark:bg-perch-primary-950/20 dark:border-perch-primary-600"
                    : "border-border bg-white hover:border-perch-primary-300 hover:shadow-sm dark:bg-perch-dark/80 dark:border-stone-800 dark:hover:border-stone-600"
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${space.name} — ₹${Math.round(space.pricePerHour / 100)} per hour`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {space.name}
                      </h3>
                      {isSelected && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-perch-primary-500 text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>
                    {space.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {space.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {space.capacityMin}-{space.capacityMax} people
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={cn("inline-block size-2 rounded-full", noise.color)} />
                        {noise.label}
                      </span>
                    </div>

                    {/* Amenities */}
                    {space.amenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {space.amenities.slice(0, 4).map((a) => (
                          <Badge key={a} variant="amenity" className="text-[10px] px-2 py-0">
                            {a}
                          </Badge>
                        ))}
                        {space.amenities.length > 4 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0">
                            +{space.amenities.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-foreground">
                      ₹{Math.round(space.pricePerHour / 100)}
                    </p>
                    <p className="text-xs text-muted-foreground">/hr</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
      </div>
    </section>
  )
}

export { CafeSpaces }
export type { CafeSpacesProps }
