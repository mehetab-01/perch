"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Calendar, Users, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

function SearchHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const city = searchParams.get("city") ?? ""
  const date = searchParams.get("date") ?? ""
  const people = searchParams.get("people") ?? ""

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      const params = new URLSearchParams(searchParams.toString())

      const newCity = fd.get("city") as string
      const newDate = fd.get("date") as string
      const newPeople = fd.get("people") as string

      if (newCity) params.set("city", newCity)
      else params.delete("city")
      if (newDate) params.set("date", newDate)
      else params.delete("date")
      if (newPeople) params.set("people", newPeople)
      else params.delete("people")

      params.set("page", "1")
      router.push(`/search?${params.toString()}`)
    },
    [router, searchParams]
  )

  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(key)
      params.set("page", "1")
      router.push(`/search?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Active filter badges (beyond the core search fields)
  const activeFilters: { key: string; label: string }[] = []
  const amenities = searchParams.get("amenities")
  if (amenities) {
    amenities.split(",").forEach((a) => {
      if (a.trim()) activeFilters.push({ key: `amenity:${a}`, label: a.trim() })
    })
  }
  const noise = searchParams.get("noiseLevel")
  if (noise) activeFilters.push({ key: "noiseLevel", label: `${noise} noise` })
  const minRating = searchParams.get("minRating")
  if (minRating) activeFilters.push({ key: "minRating", label: `${minRating}+ stars` })
  const minPrice = searchParams.get("minPrice")
  if (minPrice) activeFilters.push({ key: "minPrice", label: `₹${minPrice}+ min` })
  const maxPrice = searchParams.get("maxPrice")
  if (maxPrice) activeFilters.push({ key: "maxPrice", label: `₹${maxPrice} max` })

  const removeAmenity = useCallback(
    (amenity: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = (params.get("amenities") ?? "")
        .split(",")
        .filter((a) => a && a !== amenity)
      if (current.length > 0) {
        params.set("amenities", current.join(","))
      } else {
        params.delete("amenities")
      }
      params.set("page", "1")
      router.push(`/search?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="space-y-3">
      {/* Compact search bar */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-border bg-white p-2 shadow-sm sm:flex-row sm:items-center",
          "dark:bg-perch-dark/80 dark:border-stone-800"
        )}
      >
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="city"
            type="text"
            placeholder="City or area..."
            defaultValue={city}
            className="w-full rounded-lg bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="City or area"
          />
        </div>
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="date"
            type="date"
            defaultValue={date}
            className="w-full rounded-lg bg-transparent py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none"
            aria-label="Date"
          />
        </div>
        <div className="relative w-full sm:w-24">
          <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="people"
            type="number"
            min={1}
            max={20}
            placeholder="People"
            defaultValue={people}
            className="w-full rounded-lg bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Number of people"
          />
        </div>
        <Button type="submit" size="sm" className="shrink-0">
          <Search className="size-4" />
          <span className="sm:sr-only">Search</span>
        </Button>
      </form>

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="default" className="gap-1 pr-1">
              {f.label}
              <button
                onClick={() => {
                  if (f.key.startsWith("amenity:")) {
                    removeAmenity(f.key.replace("amenity:", ""))
                  } else {
                    removeFilter(f.key)
                  }
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-perch-primary-200 dark:hover:bg-perch-primary-800"
                aria-label={`Remove ${f.label} filter`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export { SearchHeader }
