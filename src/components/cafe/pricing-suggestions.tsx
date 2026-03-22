"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Check,
  Loader2,
  RefreshCw,
  BarChart3,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import { formatPaise } from "@/lib/utils/format"
import type {
  PricingSuggestionData,
  PricingSuggestionsResponse,
} from "@/types/cafe-dashboard"

type PricingSuggestionsProps = {
  cafeId: string
}

type ApplyState = {
  spaceId: string
  status: "confirming" | "applying" | "applied" | "error"
}

function PricingSuggestions({ cafeId }: PricingSuggestionsProps) {
  const [data, setData] = useState<PricingSuggestionsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notEnoughData, setNotEnoughData] = useState<string | null>(null)
  const [applyStates, setApplyStates] = useState<Map<string, ApplyState>>(
    new Map()
  )
  const [hasFetched, setHasFetched] = useState(false)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotEnoughData(null)

    try {
      const res = await fetch(`/api/cafes/${cafeId}/pricing-suggestions`)
      const json = await res.json()

      if (res.status === 422) {
        setNotEnoughData(json.message)
        return
      }

      if (!res.ok) {
        setError(json.error ?? "Failed to generate suggestions")
        return
      }

      setData(json as PricingSuggestionsResponse)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }, [cafeId])

  const handleApplyClick = useCallback(
    (suggestion: PricingSuggestionData) => {
      setApplyStates((prev) => {
        const next = new Map(prev)
        next.set(suggestion.spaceId + suggestion.timeSlot, {
          spaceId: suggestion.spaceId,
          status: "confirming",
        })
        return next
      })
    },
    []
  )

  const handleConfirmApply = useCallback(
    async (suggestion: PricingSuggestionData) => {
      const key = suggestion.spaceId + suggestion.timeSlot
      setApplyStates((prev) => {
        const next = new Map(prev)
        next.set(key, { spaceId: suggestion.spaceId, status: "applying" })
        return next
      })

      try {
        // The PATCH endpoint expects price in rupees (converts to paise internally)
        const priceInRupees = suggestion.suggestedPrice / 100
        const res = await fetch(`/api/spaces/${suggestion.spaceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pricePerHour: priceInRupees }),
        })

        if (!res.ok) {
          throw new Error("Failed to update price")
        }

        setApplyStates((prev) => {
          const next = new Map(prev)
          next.set(key, { spaceId: suggestion.spaceId, status: "applied" })
          return next
        })
      } catch {
        setApplyStates((prev) => {
          const next = new Map(prev)
          next.set(key, { spaceId: suggestion.spaceId, status: "error" })
          return next
        })
      }
    },
    []
  )

  const handleCancelApply = useCallback(
    (suggestion: PricingSuggestionData) => {
      const key = suggestion.spaceId + suggestion.timeSlot
      setApplyStates((prev) => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    },
    []
  )

  const isPriceIncrease = (s: PricingSuggestionData) =>
    s.suggestedPrice > s.currentPrice

  const priceChangePercent = (s: PricingSuggestionData) => {
    const diff = s.suggestedPrice - s.currentPrice
    return Math.round((diff / s.currentPrice) * 100)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">
            AI Pricing Insights
          </h2>
        </div>

        {hasFetched && data && (
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground dark:text-neutral-400 dark:hover:bg-stone-800 dark:hover:text-foreground"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        )}
      </div>

      {/* Initial state — show fetch button */}
      {!hasFetched && !loading && (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950">
            <BarChart3 className="size-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Get data-driven pricing suggestions
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Our AI analyzes your last 90 days of bookings to find revenue
              opportunities
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSuggestions}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            <Sparkles className="size-4" />
            Generate Insights
          </button>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Loader2 className="size-8 animate-spin text-amber-500" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Analyzing your booking patterns...
          </p>
        </Card>
      )}

      {/* Not enough data */}
      {notEnoughData && (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950">
            <BarChart3 className="size-7 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-medium text-foreground">Keep booking!</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {notEnoughData}
          </p>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={fetchSuggestions}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            Try again
          </button>
        </Card>
      )}

      {/* Suggestions grid */}
      {data && data.suggestions.length > 0 && !loading && (
        <>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Based on {data.totalBookingsAnalyzed} bookings over the last 90 days
            {" \u00b7 "}
            Generated{" "}
            {new Date(data.generatedAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })}
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {data.suggestions.map((suggestion, i) => {
                const key = suggestion.spaceId + suggestion.timeSlot
                const applyState = applyStates.get(key)
                const increase = isPriceIncrease(suggestion)
                const percent = priceChangePercent(suggestion)

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="overflow-hidden p-0">
                      {/* Header strip */}
                      <div
                        className={cn(
                          "flex items-center gap-2 px-5 py-3",
                          increase
                            ? "bg-emerald-50 dark:bg-emerald-950/40"
                            : "bg-blue-50 dark:bg-blue-950/40"
                        )}
                      >
                        {increase ? (
                          <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="size-4 text-blue-600 dark:text-blue-400" />
                        )}
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {suggestion.spaceName}
                        </span>
                        <span
                          className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-xs font-bold",
                            increase
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          )}
                        >
                          {increase ? "+" : ""}
                          {percent}%
                        </span>
                      </div>

                      {/* Body */}
                      <div className="space-y-3 px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">
                          {suggestion.timeSlot}
                        </p>

                        {/* Price comparison */}
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-neutral-400 line-through dark:text-neutral-500">
                            {formatPaise(suggestion.currentPrice)}
                          </span>
                          <ArrowRight className="size-4 text-neutral-300 dark:text-neutral-600" />
                          <span
                            className={cn(
                              "text-lg font-bold",
                              increase
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {formatPaise(suggestion.suggestedPrice)}
                          </span>
                          <span className="text-xs text-neutral-400">/hr</span>
                        </div>

                        {/* Reason */}
                        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {suggestion.reason}
                        </p>

                        {/* Expected impact */}
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {suggestion.expectedImpact}
                        </p>

                        {/* Apply button */}
                        <div className="pt-1">
                          {applyState?.status === "applied" ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              <Check className="size-4" />
                              Price updated
                            </div>
                          ) : applyState?.status === "confirming" ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleConfirmApply(suggestion)}
                                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                              >
                                Confirm — set to{" "}
                                {formatPaise(suggestion.suggestedPrice)}/hr
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelApply(suggestion)}
                                className="rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-stone-800"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : applyState?.status === "applying" ? (
                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                              <Loader2 className="size-4 animate-spin" />
                              Updating price...
                            </div>
                          ) : applyState?.status === "error" ? (
                            <div className="space-y-1">
                              <p className="text-xs text-red-500">
                                Failed to update. Try again.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleApplyClick(suggestion)}
                                className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                              >
                                Retry
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyClick(suggestion)}
                              className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/50"
                            >
                              Apply this price
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  )
}

export { PricingSuggestions }
