"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Star, Heart, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { MOCK_CAFES, COVER_GRADIENTS } from "@/lib/mock/cafes"

// For now, first 3 mock cafes are "favourites"
const FAVOURITE_CAFES = MOCK_CAFES.slice(0, 3)

export function FavouriteCafes() {
  if (FAVOURITE_CAFES.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FAVOURITE_CAFES.map((cafe, i) => {
        const gradient = COVER_GRADIENTS[cafe.coverPhoto] ?? COVER_GRADIENTS.amber!
        return (
          <motion.div
            key={cafe.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#111110] transition-all hover:border-perch-primary-500/25"
          >
            {/* Cover */}
            <div className={cn("h-28 bg-gradient-to-br relative", gradient)}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2.5 right-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                  <Heart className="h-3.5 w-3.5 fill-perch-primary-400 text-perch-primary-400" />
                </div>
              </div>
              <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-white">{cafe.avgRating}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3.5 space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-perch-primary-300 transition-colors">
                  {cafe.name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{cafe.neighbourhood}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-perch-primary-400 font-medium">
                <IndianRupee className="h-3 w-3" />
                <span>{(cafe.cheapestPrice / 100).toLocaleString("en-IN")}/hr</span>
              </div>
              <Link
                href={`/cafe/${cafe.slug}`}
                className="block w-full rounded-xl border border-perch-primary-500/25 bg-perch-primary-500/10 py-1.5 text-center text-xs font-semibold text-perch-primary-400 transition-all hover:bg-perch-primary-500/20"
              >
                Rebook →
              </Link>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
