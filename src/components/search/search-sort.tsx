"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const SORT_OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "price_asc", label: "Price (low-high)" },
  { value: "price_desc", label: "Price (high-low)" },
  { value: "distance", label: "Distance" },
] as const

function SearchSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sortBy") ?? "rating"

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sortBy", e.target.value)
      params.set("page", "1")
      router.push(`/search?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="size-4 text-muted-foreground" />
      <label htmlFor="sort-select" className="sr-only">
        Sort by
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className={cn(
          "rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        )}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export { SearchSort }
