"use client"

import { useState, useCallback } from "react"
import {
  Star,
  Wifi,
  Volume2,
  Maximize2,
  UserCheck,
  MessageSquare,
  Send,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { formatDateMedium } from "@/lib/utils/format"
import type {
  CafeReviewWithDetails,
  CafeReviewStats,
} from "@/types/cafe-dashboard"

type ReviewsProps = {
  reviews: CafeReviewWithDetails[]
  stats: CafeReviewStats
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name
}

const attributeConfig = [
  { key: "avgWifi" as const, label: "WiFi", icon: Wifi },
  { key: "avgNoise" as const, label: "Noise", icon: Volume2 },
  { key: "avgSpace" as const, label: "Space", icon: Maximize2 },
  { key: "avgStaff" as const, label: "Staff", icon: UserCheck },
]

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "size-4" : "size-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300 dark:text-neutral-600"
          )}
        />
      ))}
    </div>
  )
}

function CafeReviewsClient({ reviews, stats }: ReviewsProps) {
  const [reviewList, setReviewList] = useState(reviews)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleRespond = useCallback(
    async (reviewId: string) => {
      if (!responseText.trim()) return

      setIsSubmitting(true)
      try {
        const res = await fetch(`/api/reviews/${reviewId}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText.trim() }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? "Failed to respond")
        }

        setReviewList((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, cafeResponse: responseText.trim() }
              : r
          )
        )
        toast("Response published", "success")
        setRespondingTo(null)
        setResponseText("")
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed", "error")
      } finally {
        setIsSubmitting(false)
      }
    },
    [responseText, toast]
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Reviews</h1>

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Overall rating */}
        <Card className="flex flex-col items-center gap-1 p-4">
          <p className="text-2xl font-bold text-foreground">
            {stats.totalReviews > 0 ? stats.avgOverall : "—"}
          </p>
          <StarRating rating={Math.round(stats.avgOverall)} size="md" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
          </p>
        </Card>

        {/* Per-attribute averages */}
        {attributeConfig.map((attr) => {
          const value = stats[attr.key]
          return (
            <Card key={attr.key} className="flex flex-col items-center gap-1 p-4">
              <attr.icon className="size-5 text-neutral-400 dark:text-neutral-500" />
              <p className="text-lg font-bold text-foreground">
                {stats.totalReviews > 0 ? value : "—"}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {attr.label}
              </p>
            </Card>
          )
        })}

        {/* Placeholder for grid alignment */}
        <div className="hidden lg:block" />
      </div>

      {/* Review list */}
      {reviewList.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Star className="size-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No reviews yet. Reviews will appear here after workers complete their bookings.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewList.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {firstName(review.workerName)}
                      </p>
                      <StarRating rating={review.overallRating} />
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDateMedium(
                        review.createdAt instanceof Date
                          ? review.createdAt.toISOString().split("T")[0]!
                          : String(review.createdAt).split("T")[0]!
                      )}
                    </p>
                  </div>
                </div>

                {/* Attribute ratings */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "WiFi", value: review.wifiRating },
                    { label: "Noise", value: review.noiseRating },
                    { label: "Space", value: review.spaceRating },
                    { label: "Staff", value: review.staffRating },
                  ].map(
                    (attr) =>
                      attr.value != null && (
                        <span
                          key={attr.label}
                          className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-stone-800 dark:text-neutral-400"
                        >
                          {attr.label}: {attr.value}/5
                        </span>
                      )
                  )}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {review.comment}
                  </p>
                )}

                {/* Cafe response */}
                {review.cafeResponse && (
                  <div className="rounded-lg border-l-2 border-perch-primary-400 bg-perch-primary-50 p-3 dark:bg-perch-primary-950/30">
                    <p className="text-xs font-medium text-perch-primary-700 dark:text-perch-primary-400">
                      Your response
                    </p>
                    <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                      {review.cafeResponse}
                    </p>
                  </div>
                )}

                {/* Respond button / form */}
                {!review.cafeResponse && respondingTo !== review.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <MessageSquare className="size-3.5" />
                    Respond
                  </Button>
                )}

                {respondingTo === review.id && (
                  <div className="flex gap-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write a public response..."
                      maxLength={500}
                      rows={2}
                      disabled={isSubmitting}
                      className={cn(
                        "flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-neutral-400",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                        "dark:bg-stone-800 dark:border-stone-700"
                      )}
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(review.id)}
                        disabled={isSubmitting || !responseText.trim()}
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRespondingTo(null)
                          setResponseText("")
                        }}
                        disabled={isSubmitting}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export { CafeReviewsClient }
