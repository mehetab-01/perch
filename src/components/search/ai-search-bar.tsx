"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Search, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AISearchFilters } from "@/lib/ai/parse-search-query"

type AISearchBarProps = {
  onClose: () => void
  variant?: "hero" | "header"
}

const PLACEHOLDER_TEXTS = [
  "quiet cafe in Bandra with WiFi for 4 people tomorrow",
  "team meeting for 8 people Wednesday afternoon under 600/hr",
  "lively cafe with projector near BKC this Friday",
  "cheap workspace in Andheri with AC and parking",
  "best rated quiet cafe in Powai for 2 people",
]

const FILTER_LABELS: Record<string, (value: unknown) => string> = {
  city: (v) => `${v}`,
  area: (v) => `${v}`,
  date: (v) => `${v}`,
  startTime: (v) => `${v}`,
  duration: (v) => `${v}h`,
  people: (v) => `${v} people`,
  noiseLevel: (v) => `${v}`,
  maxPricePerHour: (v) => `max ₹${v}/hr`,
  sortBy: (v) => `sort: ${v}`,
}

function AISearchBar({ onClose, variant = "header" }: AISearchBarProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [extractedFilters, setExtractedFilters] = useState<AISearchFilters | null>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Typing animation for placeholder
  useEffect(() => {
    if (query) return // Don't animate if user is typing

    const targetText = PLACEHOLDER_TEXTS[placeholderIndex]
    let charIndex = 0
    let direction: "typing" | "deleting" = "typing"
    let timeout: NodeJS.Timeout

    function tick() {
      if (direction === "typing") {
        if (charIndex <= targetText.length) {
          setDisplayedPlaceholder(targetText.slice(0, charIndex))
          charIndex++
          timeout = setTimeout(tick, 35)
        } else {
          // Pause at full text, then start deleting
          timeout = setTimeout(() => {
            direction = "deleting"
            tick()
          }, 2000)
        }
      } else {
        if (charIndex > 0) {
          charIndex--
          setDisplayedPlaceholder(targetText.slice(0, charIndex))
          timeout = setTimeout(tick, 20)
        } else {
          // Move to next placeholder
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length)
        }
      }
    }

    tick()
    return () => clearTimeout(timeout)
  }, [placeholderIndex, query])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed || trimmed.length < 5) return

      setLoading(true)
      setError(null)
      setExtractedFilters(null)

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ naturalQuery: trimmed }),
        })

        if (res.status === 429) {
          setError("AI search limit reached. Try manual search.")
          setLoading(false)
          return
        }

        if (!res.ok) {
          setError("Search failed. Try again.")
          setLoading(false)
          return
        }

        const data = await res.json() as {
          aiFilters?: AISearchFilters | null
        }

        if (data.aiFilters) {
          setExtractedFilters(data.aiFilters)
        }

        // Build URL params from AI filters and navigate
        const params = new URLSearchParams()
        const filters = data.aiFilters
        if (filters) {
          if (filters.area) params.set("city", filters.area)
          else if (filters.city) params.set("city", filters.city)
          if (filters.date) params.set("date", filters.date)
          if (filters.people) params.set("people", String(filters.people))
          if (filters.noiseLevel) params.set("noiseLevel", filters.noiseLevel)
          if (filters.maxPricePerHour) params.set("maxPrice", String(filters.maxPricePerHour))
          if (filters.amenities && filters.amenities.length > 0) {
            params.set("amenities", filters.amenities.join(","))
          }
          if (filters.sortBy) params.set("sortBy", filters.sortBy)
          if (filters.startTime) params.set("startTime", filters.startTime)
        }

        router.push(`/search?${params.toString()}`)
      } catch {
        setError("Something went wrong. Try manual search.")
      } finally {
        setLoading(false)
      }
    },
    [query, router]
  )

  const removeFilter = useCallback(
    (key: string) => {
      if (!extractedFilters) return
      const updated = { ...extractedFilters, [key]: key === "amenities" ? [] : null }
      setExtractedFilters(updated)

      // Rebuild URL with remaining filters
      const params = new URLSearchParams()
      if (key !== "area" && key !== "city") {
        if (updated.area) params.set("city", updated.area)
        else if (updated.city) params.set("city", updated.city)
      }
      if (key !== "date" && updated.date) params.set("date", updated.date)
      if (key !== "people" && updated.people) params.set("people", String(updated.people))
      if (key !== "noiseLevel" && updated.noiseLevel) params.set("noiseLevel", updated.noiseLevel)
      if (key !== "maxPricePerHour" && updated.maxPricePerHour) params.set("maxPrice", String(updated.maxPricePerHour))
      if (key !== "amenities" && updated.amenities && updated.amenities.length > 0) {
        params.set("amenities", updated.amenities.join(","))
      }
      if (key !== "sortBy" && updated.sortBy) params.set("sortBy", updated.sortBy)

      router.push(`/search?${params.toString()}`)
    },
    [extractedFilters, router]
  )

  const isHero = variant === "hero"

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border p-2 transition-colors",
            isHero
              ? "border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20"
              : "border-border bg-white shadow-sm dark:bg-perch-dark/80 dark:border-stone-800"
          )}
        >
          <div className="flex items-center gap-2 px-2">
            <Sparkles
              className={cn(
                "size-4 shrink-0",
                loading ? "animate-pulse" : "",
                isHero ? "text-perch-primary-400" : "text-perch-primary-500"
              )}
            />
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={displayedPlaceholder || "Describe what you're looking for..."}
            disabled={loading}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500",
              isHero
                ? "text-white"
                : "text-foreground"
            )}
            aria-label="AI search query"
          />

          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setExtractedFilters(null)
                setError(null)
                inputRef.current?.focus()
              }}
              className={cn(
                "rounded-full p-1 transition-colors",
                isHero
                  ? "text-neutral-400 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={loading || query.trim().length < 5}
            className={cn(
              "shrink-0",
              isHero && "bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 text-black hover:opacity-90"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="hidden sm:inline">Parsing...</span>
              </>
            ) : (
              <>
                <Search className="size-4" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
              isHero
                ? "text-neutral-400 hover:text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-label="Switch to manual search"
          >
            Manual
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      {/* Extracted filter badges */}
      <AnimatePresence>
        {extractedFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap gap-2"
          >
            {Object.entries(extractedFilters).map(([key, value]) => {
              if (value === null || value === undefined) return null
              if (key === "amenities" && Array.isArray(value)) {
                return value.map((amenity) => (
                  <motion.div
                    key={`amenity-${amenity}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="amenity" className="gap-1 pr-1">
                      {amenity}
                      <button
                        onClick={() => removeFilter("amenities")}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-perch-primary-200 dark:hover:bg-perch-primary-800"
                        aria-label={`Remove ${amenity} filter`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))
              }

              const labelFn = FILTER_LABELS[key]
              if (!labelFn) return null

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="amenity" className="gap-1 pr-1">
                    {labelFn(value)}
                    <button
                      onClick={() => removeFilter(key)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-perch-primary-200 dark:hover:bg-perch-primary-800"
                      aria-label={`Remove ${key} filter`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { AISearchBar }
