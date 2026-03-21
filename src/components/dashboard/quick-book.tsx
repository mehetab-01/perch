"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatPaise } from "@/lib/utils/format"
import type { QuickBookCafe } from "@/types/dashboard"

export function QuickBook({ cafes }: { cafes: QuickBookCafe[] }) {
  if (cafes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center dark:bg-stone-900">
        <p className="text-neutral-600 dark:text-neutral-400">No recent cafes yet</p>
        <Link
          href="/search"
          className="mt-2 inline-block text-sm font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
        >
          Explore cafes →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
      {cafes.map((cafe, i) => (
        <motion.div
          key={cafe.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="shrink-0"
        >
          <Link
            href={`/cafe/${cafe.slug}`}
            className={cn(
              "flex w-56 flex-col gap-3 rounded-xl border border-border bg-white p-4 transition-all",
              "hover:border-perch-primary-200 hover:shadow-md dark:bg-stone-900 dark:hover:border-perch-primary-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
            )}
          >
            {/* Gradient placeholder */}
            <div className="h-24 w-full rounded-lg bg-gradient-to-br from-perch-primary-100 to-perch-secondary-100 dark:from-perch-primary-950 dark:to-perch-secondary-950" />

            <div>
              <h3 className="truncate font-semibold text-foreground">
                {cafe.name}
              </h3>
              <p className="mt-1 flex items-start gap-1 text-sm text-neutral-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2">{cafe.address}</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium text-perch-primary-600 dark:text-perch-primary-400">
                <IndianRupee className="h-3.5 w-3.5" />
                From {formatPaise(cafe.cheapestPrice)}/hr
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
