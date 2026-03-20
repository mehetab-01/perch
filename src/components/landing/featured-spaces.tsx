"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Star, Wifi, Zap, Coffee, Layout, Monitor, Wind, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type AmenityKey = "WiFi" | "Power" | "Coffee" | "Whiteboard" | "AC" | "Projector" | "Quiet"

const amenityIcons: Record<AmenityKey, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" aria-hidden="true" />,
  Power: <Zap className="h-3 w-3" aria-hidden="true" />,
  Coffee: <Coffee className="h-3 w-3" aria-hidden="true" />,
  Whiteboard: <Layout className="h-3 w-3" aria-hidden="true" />,
  AC: <Wind className="h-3 w-3" aria-hidden="true" />,
  Projector: <Monitor className="h-3 w-3" aria-hidden="true" />,
  Quiet: <Volume2 className="h-3 w-3" aria-hidden="true" />,
}

interface SpaceData {
  id: number
  name: string
  location: string
  pricePerHour: number
  capacityMin: number
  capacityMax: number
  rating: number
  reviewCount: number
  amenities: AmenityKey[]
  gradient: string
}

const spaces: SpaceData[] = [
  {
    id: 1,
    name: "Brew & Meet",
    location: "Bandra West, Mumbai",
    pricePerHour: 450,
    capacityMin: 2,
    capacityMax: 8,
    rating: 4.9,
    reviewCount: 124,
    amenities: ["WiFi", "Power", "Coffee"],
    gradient: "from-amber-400 via-orange-400 to-rose-400",
  },
  {
    id: 2,
    name: "The Quiet Corner",
    location: "Koramangala, Bengaluru",
    pricePerHour: 380,
    capacityMin: 1,
    capacityMax: 4,
    rating: 4.7,
    reviewCount: 89,
    amenities: ["WiFi", "Whiteboard", "AC"],
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
  },
  {
    id: 3,
    name: "Pages & Pours",
    location: "Hauz Khas, Delhi",
    pricePerHour: 520,
    capacityMin: 4,
    capacityMax: 12,
    rating: 4.8,
    reviewCount: 211,
    amenities: ["Projector", "WiFi", "Power"],
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
  },
  {
    id: 4,
    name: "Roast & Focus",
    location: "Indiranagar, Bengaluru",
    pricePerHour: 290,
    capacityMin: 1,
    capacityMax: 3,
    rating: 4.6,
    reviewCount: 67,
    amenities: ["WiFi", "Coffee", "Quiet"],
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
  },
]

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < full
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function SpaceCard({ space, index }: { space: SpaceData; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25)" }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white",
        "dark:border-neutral-800 dark:bg-neutral-900",
        "cursor-pointer transition-shadow duration-300"
      )}
    >
      {/* Placeholder image */}
      <div
        className={cn(
          "relative h-44 w-full bg-gradient-to-br",
          space.gradient
        )}
        aria-hidden="true"
      >
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-black/10" />
        {/* Capacity badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {space.capacityMin}–{space.capacityMax} people
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Name and price */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold tracking-tight text-neutral-950 dark:text-white">
              {space.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {space.location}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-base font-bold text-neutral-950 dark:text-white">
              ₹{space.pricePerHour}
            </span>
            <span className="text-xs text-neutral-400">/hr</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={space.rating} />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {space.rating}
          </span>
          <span className="text-xs text-neutral-400">
            ({space.reviewCount})
          </span>
        </div>

        {/* Amenity tags */}
        <div className="flex flex-wrap gap-1.5">
          {space.amenities.map((amenity) => (
            <span
              key={amenity}
              className={cn(
                "flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600",
                "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              )}
            >
              {amenityIcons[amenity]}
              {amenity}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          aria-label={`View ${space.name}`}
          className={cn(
            "mt-auto w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition-colors",
            "hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700",
            "dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-amber-500 dark:hover:bg-amber-500/10 dark:hover:text-amber-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          )}
        >
          View space
        </button>
      </div>
    </motion.article>
  )
}

export function FeaturedSpaces() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })

  return (
    <section className="bg-white py-24 dark:bg-neutral-950 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
            Popular spaces
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
            Popular spaces near you
          </h2>
          <p className="max-w-sm text-base text-neutral-500 dark:text-neutral-400">
            Hand-picked spots that professionals keep coming back to.
          </p>
        </div>

        {/* Grid */}
        <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {inView &&
            spaces.map((space, i) => (
              <SpaceCard key={space.id} space={space} index={i} />
            ))}
          {!inView &&
            spaces.map((space) => (
              <div
                key={space.id}
                className="h-80 rounded-2xl border border-neutral-200 bg-neutral-50 opacity-0 dark:border-neutral-800 dark:bg-neutral-900"
                aria-hidden="true"
              />
            ))}
        </div>

        {/* View all */}
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            className={cn(
              "rounded-full border border-neutral-300 bg-white px-7 py-3 text-sm font-semibold text-neutral-700 transition-all",
              "hover:border-amber-400 hover:text-amber-600 hover:shadow-md",
              "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-amber-500 dark:hover:text-amber-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            )}
          >
            Explore all spaces
          </button>
        </div>
      </div>
    </section>
  )
}
