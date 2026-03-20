"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Star, Wifi, Zap, Coffee, Monitor, Wind, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Badge } from "@/components/ui/badge"

type AmenityKey = "WiFi" | "Power" | "Coffee" | "Whiteboard" | "AC" | "Projector" | "Quiet"

const amenityIcons: Record<AmenityKey, React.ReactNode> = {
  WiFi: <Wifi className="h-3 w-3" aria-hidden="true" />,
  Power: <Zap className="h-3 w-3" aria-hidden="true" />,
  Coffee: <Coffee className="h-3 w-3" aria-hidden="true" />,
  Whiteboard: <Monitor className="h-3 w-3" aria-hidden="true" />,
  AC: <Wind className="h-3 w-3" aria-hidden="true" />,
  Projector: <Monitor className="h-3 w-3" aria-hidden="true" />,
  Quiet: <Volume2 className="h-3 w-3" aria-hidden="true" />,
}

interface SpaceData {
  id: number
  name: string
  location: string
  pricePerHour: number
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
    rating: 4.7,
    reviewCount: 89,
    amenities: ["WiFi", "AC", "Quiet"],
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
  },
  {
    id: 3,
    name: "Pages & Pours",
    location: "Hauz Khas, Delhi",
    pricePerHour: 520,
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
    rating: 4.6,
    reviewCount: 67,
    amenities: ["WiFi", "Coffee", "Quiet"],
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
  },
  {
    id: 5,
    name: "Filter House",
    location: "Andheri East, Mumbai",
    pricePerHour: 350,
    rating: 4.8,
    reviewCount: 156,
    amenities: ["WiFi", "Whiteboard", "AC"],
    gradient: "from-rose-400 via-pink-500 to-red-500",
  },
  {
    id: 6,
    name: "Bean Counter Cafe",
    location: "Powai, Mumbai",
    pricePerHour: 400,
    rating: 4.7,
    reviewCount: 93,
    amenities: ["Projector", "Coffee", "Power"],
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
  },
]

function SpaceCard({ space, index }: { space: SpaceData; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)" }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white",
        "dark:border-neutral-800 dark:bg-neutral-900",
        "cursor-pointer transition-shadow duration-300"
      )}
    >
      {/* Placeholder image */}
      <div
        className={cn("relative h-44 w-full bg-gradient-to-br", space.gradient)}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/10" />
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
              \u20B9{space.pricePerHour}
            </span>
            <span className="text-xs text-neutral-500">/hr</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-perch-primary-400 text-perch-primary-400" aria-hidden="true" />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {space.rating}
          </span>
          <span className="text-xs text-neutral-500">({space.reviewCount})</span>
        </div>

        {/* Amenity tags */}
        <div className="flex flex-wrap gap-1.5">
          {space.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="amenity" className="gap-1">
              {amenityIcons[amenity]}
              {amenity}
            </Badge>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function FeaturedSpaces() {
  return (
    <section className="bg-white py-24 dark:bg-neutral-950 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-perch-primary-500">
            Popular spaces
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
            Popular meeting spots in Mumbai
          </h2>
          <p className="max-w-sm text-base text-neutral-500 dark:text-neutral-400">
            Hand-picked spots that professionals keep coming back to.
          </p>
        </div>

        {/* Grid — 3 columns desktop, 1 mobile */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space, i) => (
            <SpaceCard key={space.id} space={space} index={i} />
          ))}
        </div>

        {/* View all */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/search"
            className={cn(
              "rounded text-sm font-semibold text-perch-primary-600 transition-colors hover:text-perch-primary-500",
              "dark:text-perch-primary-400 dark:hover:text-perch-primary-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
            )}
          >
            View all spaces &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
