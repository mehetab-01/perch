import {
  Wifi,
  Monitor,
  PenTool,
  Plug,
  Snowflake,
  Car,
  Coffee,
  Printer,
  Volume2,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { Space } from "@/lib/db/schema"

const amenityIconMap: Record<string, { icon: LucideIcon; label: string }> = {
  wifi: { icon: Wifi, label: "WiFi" },
  projector: { icon: Monitor, label: "Projector" },
  whiteboard: { icon: PenTool, label: "Whiteboard" },
  "power outlets": { icon: Plug, label: "Power Outlets" },
  ac: { icon: Snowflake, label: "AC" },
  parking: { icon: Car, label: "Parking" },
  "coffee included": { icon: Coffee, label: "Coffee Included" },
  printer: { icon: Printer, label: "Printer" },
}

const noiseMeterMap: Record<string, { level: number; label: string; color: string }> = {
  quiet: { level: 1, label: "Quiet — ideal for focused work", color: "bg-emerald-500" },
  moderate: { level: 2, label: "Moderate — comfortable for meetings", color: "bg-amber-500" },
  lively: { level: 3, label: "Lively — energetic cafe buzz", color: "bg-rose-500" },
}

type CafeAmenitiesProps = {
  spaces: Space[]
}

function CafeAmenities({ spaces }: CafeAmenitiesProps) {
  const allAmenities = [...new Set(spaces.flatMap((s) => s.amenities))]
  const primaryNoise = spaces[0]?.noiseLevel ?? "moderate"
  const noise = noiseMeterMap[primaryNoise] ?? noiseMeterMap.moderate!

  return (
    <section aria-label="Amenities">
      <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
        Amenities & facilities
      </h2>

      {/* Amenity grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {allAmenities.map((amenity) => {
          const mapped = amenityIconMap[amenity.toLowerCase()]
          const Icon = mapped?.icon ?? Coffee
          const label = mapped?.label ?? amenity

          return (
            <div
              key={amenity}
              className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-3 dark:bg-perch-dark/80 dark:border-stone-800"
            >
              <Icon className="size-5 shrink-0 text-perch-primary-500" />
              <span className="text-sm text-foreground">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Noise level meter */}
      <div className="mt-6 rounded-lg border border-border bg-white p-4 dark:bg-perch-dark/80 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <Volume2 className="size-5 text-muted-foreground" aria-hidden="true" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Noise level
              </span>
              <span className="text-xs text-muted-foreground">
                {noise.label}
              </span>
            </div>
            <div
              className="mt-2 flex gap-1.5"
              role="meter"
              aria-label="Noise level"
              aria-valuenow={noise.level}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuetext={noise.label}
            >
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  aria-hidden="true"
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    bar <= noise.level ? noise.color : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { CafeAmenities }
export type { CafeAmenitiesProps }
