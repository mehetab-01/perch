import { MapPin, Star, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import type { Cafe, Space } from "@/lib/db/schema"

type CafeInfoProps = {
  cafe: Cafe
  spaces: Space[]
}

function CafeInfo({ cafe, spaces }: CafeInfoProps) {
  // Collect all unique amenities across spaces
  const allAmenities = [...new Set(spaces.flatMap((s) => s.amenities))]
  const isVerified = cafe.verificationStatus === "verified"

  return (
    <div className="space-y-3">
      {/* Name + verification */}
      <div className="flex items-start gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          {cafe.name}
        </h1>
        {isVerified && (
          <span
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-perch-secondary-50 px-2.5 py-1 text-xs font-medium text-perch-secondary-700 dark:bg-perch-secondary-950/50 dark:text-perch-secondary-400"
            aria-label="Verified cafe"
          >
            <BadgeCheck className="size-3.5" />
            Verified
          </span>
        )}
      </div>

      {/* Location */}
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-4 shrink-0" />
        <span>{cafe.address}</span>
      </p>

      {/* Rating */}
      {cafe.totalReviews > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < Math.round(cafe.avgRating)
                    ? "fill-perch-primary-400 text-perch-primary-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-foreground">
            {cafe.avgRating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            ({cafe.totalReviews} {cafe.totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {/* Description */}
      {cafe.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {cafe.description}
        </p>
      )}

      {/* Quick amenities */}
      {allAmenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allAmenities.slice(0, 5).map((amenity) => (
            <Badge key={amenity} variant="amenity">
              {amenity}
            </Badge>
          ))}
          {allAmenities.length > 5 && (
            <Badge variant="outline">+{allAmenities.length - 5} more</Badge>
          )}
        </div>
      )}
    </div>
  )
}

export { CafeInfo }
export type { CafeInfoProps }
