"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react"
import { CafeSearchCard } from "@/components/search/cafe-search-card"
import { SearchSort } from "@/components/search/search-sort"
import { Button } from "@/components/ui/button"
import type { SearchResponse, SearchCafe } from "@/types/search"

/* ── Skeleton loader ── */

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-white dark:bg-perch-dark/80 dark:border-stone-800">
      <div className="aspect-[16/10] bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}

/* ── Empty state ── */

function EmptyState({ city }: { city: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-perch-primary-50 dark:bg-perch-primary-950/30">
        <SearchX className="size-10 text-perch-primary-400" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        No spaces found
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {city
          ? `We couldn't find any verified spaces in ${city} matching your filters. Try adjusting your criteria.`
          : "Try searching for a city or adjusting your filters to find meeting spaces."}
      </p>
    </motion.div>
  )
}

/* ── Pagination ── */

type PaginationProps = {
  page: number
  totalPages: number
}

function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goTo = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(p))
      router.push(`/search?${params.toString()}`)
    },
    [router, searchParams]
  )

  if (totalPages <= 1) return null

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="px-3 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

/* ── Main component ── */

function SearchResults() {
  const searchParams = useSearchParams()
  const [cafes, setCafes] = useState<SearchCafe[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCafes: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  const city = searchParams.get("city")

  useEffect(() => {
    const controller = new AbortController()

    async function fetchResults() {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?${searchParams.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("Search failed")
        const data: SearchResponse = await res.json()
        setCafes(data.cafes)
        setPagination(data.pagination)
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setCafes([])
          setPagination({ page: 1, limit: 20, totalCafes: 0, totalPages: 0 })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
    return () => controller.abort()
  }, [searchParams])

  return (
    <div className="flex-1">
      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            <span className="inline-block h-4 w-40 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {pagination.totalCafes}
              </span>{" "}
              {pagination.totalCafes === 1 ? "space" : "spaces"} found
              {city && (
                <>
                  {" "}
                  in <span className="font-medium text-foreground">{city}</span>
                </>
              )}
            </>
          )}
        </p>
        <SearchSort />
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : cafes.length === 0 ? (
        <EmptyState city={city} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {cafes.map((cafe, i) => (
              <CafeSearchCard key={cafe.id} cafe={cafe} index={i} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
          />
        </>
      )}
    </div>
  )
}

export { SearchResults }
