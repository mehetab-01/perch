"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"
import type { SearchCafe } from "@/types/search"

// Deterministic gradient from cafe name
function nameToGradient(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const gradients = [
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
    "from-rose-400 to-pink-500",
    "from-sky-400 to-blue-500",
    "from-lime-400 to-green-500",
  ]
  return gradients[hash % gradients.length]!
}

const noiseLabelMap: Record<string, { label: string; color: string }> = {
  quiet: { label: "Quiet", color: "bg-emerald-500" },
  moderate: { label: "Moderate", color: "bg-amber-500" },
  lively: { label: "Lively", color: "bg-rose-500" },
}

type CafeSearchCardProps = {
  cafe: SearchCafe
  index: number
}

function CafeSearchCard({ cafe, index }: CafeSearchCardProps) {
  const cheapestSpace = cafe.spaces.reduce(
    (min, s) => (s.pricePerHour < min.pricePerHour ? s : min),
    cafe.spaces[0]!
  )
  const noise = noiseLabelMap[cheapestSpace.noiseLevel] ?? noiseLabelMap.moderate!
  const allAmenities = [...new Set(cafe.spaces.flatMap((s) => s.amenities))]
  const capacityRange = {
    min: Math.min(...cafe.spaces.map((s) => s.capacityMin)),
    max: Math.max(...cafe.spaces.map((s) => s.capacityMax)),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link
        href={`/cafe/${cafe.slug}`}
        className="group block"
        aria-label={`View ${cafe.name} — from ₹${Math.round(cafe.cheapestPrice / 100)}/hr`}
      >
        <motion.article
          whileHover={{ y: -4, rotateX: 1, rotateY: -1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-white shadow-sm",
            "dark:bg-perch-dark/80 dark:border-stone-800",
            "transition-shadow hover:shadow-lg"
          )}
        >
          {/* Photo placeholder */}
          <div
            className={cn(
              "relative aspect-[16/10] bg-gradient-to-br",
              nameToGradient(cafe.name)
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-white/70">
                {cafe.name.charAt(0)}
              </span>
            </div>

            {/* Rating badge */}
            {cafe.avgRating > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <Star className="size-3 fill-perch-primary-400 text-perch-primary-400" />
                {cafe.avgRating.toFixed(1)}
              </div>
            )}

            {/* Distance badge */}
            {cafe.distance !== null && (
              <div className="absolute top-3 left-3 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {cafe.distance < 1
                  ? `${Math.round(cafe.distance * 1000)}m`
                  : `${cafe.distance.toFixed(1)}km`}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-semibold text-foreground group-hover:text-perch-primary-600 dark:group-hover:text-perch-primary-400 transition-colors">
                  {cafe.name}
                </h3>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {cafe.address.split(",").slice(0, 2).join(",")}
                </p>
              </div>
              <p className="shrink-0 text-right">
                <span className="text-base font-semibold text-foreground">
                  ₹{Math.round(cafe.cheapestPrice / 100)}
                </span>
                <span className="text-xs text-muted-foreground">/hr</span>
              </p>
            </div>

            {/* Meta row */}
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              {cafe.totalReviews > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-perch-primary-400 text-perch-primary-400" />
                  {cafe.avgRating.toFixed(1)} ({cafe.totalReviews})
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {capacityRange.min}-{capacityRange.max}
              </span>
              <span className="flex items-center gap-1">
                <span className={cn("inline-block size-2 rounded-full", noise.color)} />
                {noise.label}
              </span>
            </div>

            {/* Amenity badges */}
            {allAmenities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {allAmenities.slice(0, 3).map((a) => (
                  <Badge key={a} variant="amenity">
                    {a}
                  </Badge>
                ))}
                {allAmenities.length > 3 && (
                  <Badge variant="outline">+{allAmenities.length - 3}</Badge>
                )}
              </div>
            )}
          </div>
        </motion.article>
      </Link>
    </motion.div>
  )
}

export { CafeSearchCard }
export type { CafeSearchCardProps }
