"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, IndianRupee, Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatPaise } from "@/lib/utils/format"
import type { QuickBookCafe } from "@/types/dashboard"

// Deterministic gradient per cafe based on name char codes
function cafeGradient(name: string) {
  const gradients = [
    "from-perch-primary-900/60 via-perch-primary-950/80 to-[#0C0A09]",
    "from-emerald-900/50 via-emerald-950/80 to-[#0C0A09]",
    "from-orange-900/50 via-orange-950/80 to-[#0C0A09]",
  ]
  const idx = name.charCodeAt(0) % gradients.length
  return gradients[idx]
}

export function QuickBook({ cafes }: { cafes: QuickBookCafe[] }) {
  if (cafes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-perch-primary-500/20 bg-perch-primary-500/10">
          <Search className="h-5 w-5 text-perch-primary-400" />
        </div>
        <p className="text-sm font-medium text-neutral-300">No recent cafes yet</p>
        <p className="mt-1 text-xs text-neutral-600">Cafes you book will appear here</p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-4 py-2 text-xs font-semibold text-black transition-all hover:opacity-90"
        >
          Explore cafes
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin">
      {cafes.map((cafe, i) => (
        <motion.div
          key={cafe.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="shrink-0"
        >
          <Link
            href={`/cafe/${cafe.slug}`}
            className={cn(
              "group flex w-52 flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] transition-all",
              "hover:border-perch-primary-500/30 hover:shadow-lg hover:shadow-perch-primary-500/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
            )}
          >
            {/* Gradient image placeholder */}
            <div className={cn("relative h-28 w-full bg-gradient-to-br", cafeGradient(cafe.name))}>
              {/* Initial letter */}
              <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/10 select-none font-display">
                {cafe.name.charAt(0)}
              </span>
              {/* Amber glow */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at 30% 30%, rgba(245,158,11,0.08), transparent 70%)",
                }}
              />
            </div>

            <div className="p-3.5">
              <h3 className="truncate text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">
                {cafe.name}
              </h3>
              <p className="mt-1 flex items-start gap-1 text-xs text-neutral-500">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-neutral-600" />
                <span className="line-clamp-1">{cafe.address}</span>
              </p>
              <p className="mt-2 flex items-center gap-0.5 text-xs font-semibold text-perch-primary-400">
                <IndianRupee className="h-3 w-3" />
                From {formatPaise(cafe.cheapestPrice)}/hr
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
