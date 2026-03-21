"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"

const AMENITY_OPTIONS = [
  "WiFi",
  "Projector",
  "Whiteboard",
  "Power Outlets",
  "AC",
  "Parking",
  "Coffee Included",
  "Printer",
] as const

const NOISE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "quiet", label: "Quiet" },
  { value: "moderate", label: "Moderate" },
  { value: "lively", label: "Lively" },
] as const

function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentAmenities = (searchParams.get("amenities") ?? "")
    .split(",")
    .filter(Boolean)
  const currentNoise = searchParams.get("noiseLevel") ?? ""
  const currentMinRating = Number(searchParams.get("minRating") ?? "0")
  const currentMinPrice = searchParams.get("minPrice") ?? ""
  const currentMaxPrice = searchParams.get("maxPrice") ?? ""

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.set("page", "1") // reset page on filter change
      router.push(`/search?${params.toString()}`)
    },
    [router, searchParams]
  )

  const toggleAmenity = useCallback(
    (amenity: string) => {
      const current = new Set(currentAmenities)
      if (current.has(amenity.toLowerCase())) {
        current.delete(amenity.toLowerCase())
      } else {
        current.add(amenity.toLowerCase())
      }
      updateParam("amenities", [...current].join(","))
    },
    [currentAmenities, updateParam]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const city = searchParams.get("city")
    const date = searchParams.get("date")
    const people = searchParams.get("people")
    if (city) params.set("city", city)
    if (date) params.set("date", date)
    if (people) params.set("people", people)
    router.push(`/search?${params.toString()}`)
  }, [router, searchParams])

  const hasFilters =
    currentAmenities.length > 0 ||
    currentNoise !== "" ||
    currentMinRating > 0 ||
    currentMinPrice !== "" ||
    currentMaxPrice !== ""

  const filterContent = (
    <div className="space-y-6">
      {/* Price range */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Price range (₹/hr)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={currentMinPrice}
            onChange={(e) => updateParam("minPrice", e.target.value)}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label="Minimum price per hour"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={currentMaxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            aria-label="Maximum price per hour"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Amenities
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const active = currentAmenities.includes(amenity.toLowerCase())
            return (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/50 dark:text-perch-primary-400 dark:border-perch-primary-700"
                    : "border-border text-muted-foreground hover:border-perch-primary-300 hover:text-foreground"
                )}
                aria-pressed={active}
                aria-label={`Filter by ${amenity}`}
              >
                {amenity}
              </button>
            )
          })}
        </div>
      </div>

      {/* Noise level */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Noise level
        </h4>
        <div className="flex flex-wrap gap-2">
          {NOISE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("noiseLevel", opt.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                currentNoise === opt.value
                  ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/50 dark:text-perch-primary-400"
                  : "border-border text-muted-foreground hover:border-perch-primary-300"
              )}
              aria-pressed={currentNoise === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum rating */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Minimum rating
        </h4>
        <div className="flex gap-1">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                updateParam("minRating", rating === 0 ? "" : String(rating))
              }
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors",
                currentMinRating === rating
                  ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/50 dark:text-perch-primary-400"
                  : "border-border text-muted-foreground hover:border-perch-primary-300"
              )}
              aria-pressed={currentMinRating === rating}
              aria-label={rating === 0 ? "Any rating" : `${rating}+ stars`}
            >
              {rating === 0 ? (
                "Any"
              ) : (
                <>
                  {rating}
                  <Star className="size-3 fill-current" />
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="w-full"
          aria-label="Clear all filters"
        >
          Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="sticky top-20 rounded-xl border border-border bg-white p-5 dark:bg-perch-dark/80 dark:border-stone-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <SlidersHorizontal className="size-4" />
              Filters
            </h3>
            {hasFilters && (
              <Badge variant="default">{currentAmenities.length + (currentNoise ? 1 : 0) + (currentMinRating ? 1 : 0) + (currentMinPrice ? 1 : 0) + (currentMaxPrice ? 1 : 0)}</Badge>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <Button
          onClick={() => setMobileOpen(true)}
          size="lg"
          className="rounded-full shadow-lg"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {hasFilters && (
            <Badge variant="secondary" className="ml-1">
              {currentAmenities.length + (currentNoise ? 1 : 0) + (currentMinRating ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-white p-5 pb-8 dark:bg-stone-900 dark:border-stone-700 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Filters
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Close filters"
                >
                  <X className="size-5" />
                </button>
              </div>
              {filterContent}
              <div className="mt-6">
                <Button
                  onClick={() => setMobileOpen(false)}
                  className="w-full"
                  size="lg"
                >
                  Show results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export { SearchFilters }
