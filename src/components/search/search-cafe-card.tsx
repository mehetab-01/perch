"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  MapPin,
  Star,
  Wifi,
  Projector,
  Wind,
  PenLine,
  Volume2,
  VolumeX,
  Volume1,
  Users,
  IndianRupee,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { COVER_GRADIENTS, type MockCafe } from "@/lib/mock/cafes"

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" />,
  Projector: <Projector className="h-3 w-3" />,
  AC: <Wind className="h-3 w-3" />,
  Whiteboard: <PenLine className="h-3 w-3" />,
}

const SHOWN_AMENITIES = ["WiFi", "Projector", "AC", "Whiteboard"]

function NoiseBadge({ level }: { level: "quiet" | "moderate" | "lively" }) {
  const config = {
    quiet: { icon: <VolumeX className="h-3 w-3" />, label: "Quiet", cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
    moderate: { icon: <Volume1 className="h-3 w-3" />, label: "Moderate", cls: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
    lively: { icon: <Volume2 className="h-3 w-3" />, label: "Lively", cls: "border-red-500/20 bg-red-500/10 text-red-400" },
  }
  const { icon, label, cls } = config[level]
  return (
    <span className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>
      {icon}{label}
    </span>
  )
}

// Collect all unique amenities across all spaces of a cafe
function getCafeAmenities(cafe: MockCafe): string[] {
  const set = new Set<string>()
  cafe.spaces.forEach((s) => s.amenities.forEach((a) => set.add(a)))
  return Array.from(set)
}

function getLowestNoise(cafe: MockCafe): "quiet" | "moderate" | "lively" {
  const order = ["quiet", "moderate", "lively"]
  const levels = cafe.spaces.map((s) => s.noiseLevel)
  for (const l of order) {
    if (levels.includes(l as "quiet" | "moderate" | "lively")) return l as "quiet" | "moderate" | "lively"
  }
  return "moderate"
}

type Props = {
  cafe: MockCafe
  index?: number
}

export function SearchCafeCard({ cafe, index = 0 }: Props) {
  const gradient = COVER_GRADIENTS[cafe.coverPhoto] ?? COVER_GRADIENTS.amber
  const allAmenities = getCafeAmenities(cafe)
  const shownAmenities = SHOWN_AMENITIES.filter((a) => allAmenities.includes(a))
  const cheapestSpace = cafe.spaces.reduce((m, s) => s.pricePerHour < m.pricePerHour ? s : m, cafe.spaces[0]!)
  const noiseLevel = getLowestNoise(cafe)
  const maxCapacity = Math.max(...cafe.spaces.map((s) => s.capacityMax))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="group overflow-hidden rounded-2xl border border-white/8 bg-[#111110] hover:border-perch-primary-500/30 transition-all"
    >
      {/* Cover photo / gradient */}
      <div className={cn("relative h-36 bg-gradient-to-br", gradient)}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Rating badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-white">{cafe.avgRating.toFixed(1)}</span>
          <span className="text-xs text-white/60">({cafe.totalReviews})</span>
        </div>
        {/* Noise badge */}
        <div className="absolute bottom-3 left-3">
          <NoiseBadge level={noiseLevel} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name + neighbourhood */}
        <div>
          <h3 className="font-semibold text-white group-hover:text-perch-primary-300 transition-colors truncate">
            {cafe.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{cafe.neighbourhood}</span>
            <span className="ml-1 text-neutral-600">· {cafe.distance}</span>
          </div>
        </div>

        {/* Price + capacity */}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-0.5 font-medium text-perch-primary-300">
            <IndianRupee className="h-3.5 w-3.5" />
            {(cheapestSpace.pricePerHour / 100).toLocaleString("en-IN")}
            <span className="text-neutral-500 font-normal">/hr</span>
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Up to {maxCapacity}
          </span>
        </div>

        {/* Amenity pills */}
        {shownAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shownAmenities.map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-xs text-neutral-400"
              >
                {AMENITY_ICONS[a]}
                {a}
              </span>
            ))}
          </div>
        )}

        {/* View Space button */}
        <Link
          href={`/cafe/${cafe.slug}`}
          className="block w-full rounded-xl bg-perch-primary-500/15 border border-perch-primary-500/25 py-2 text-center text-sm font-semibold text-perch-primary-400 transition-all hover:bg-perch-primary-500/25 hover:text-perch-primary-300"
        >
          View Space
        </Link>
      </div>
    </motion.div>
  )
}
