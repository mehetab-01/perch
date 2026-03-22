"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Wifi, Volume2, Maximize, UserCheck, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { ReviewWithAuthor } from "@/types/cafe"

/* ── Rating bar ── */

type RatingBarProps = { stars: number; count: number; total: number }

function RatingBar({ stars, count, total }: RatingBarProps) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-muted-foreground">{stars}</span>
      <Star className="size-3 fill-perch-primary-400 text-perch-primary-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-perch-primary-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs text-muted-foreground">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

/* ── Attribute rating ── */

type AttrRatingProps = {
  icon: React.ReactNode
  label: string
  value: number | null
}

const attrColors: Record<string, string> = {
  WiFi: "bg-blue-500",
  Noise: "bg-emerald-500",
  Space: "bg-amber-500",
  Staff: "bg-purple-500",
}

function AttrRating({ icon, label, value }: AttrRatingProps) {
  if (value === null) return null
  const pct = (value / 5) * 100
  const barColor = attrColors[label] ?? "bg-perch-primary-400"
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1 text-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
          <Star className="size-3 fill-perch-primary-400 text-perch-primary-400" />
        </div>
      </div>
      <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ── Individual review card ── */

type ReviewCardProps = { review: ReviewWithAuthor; index: number }

function ReviewCard({ review, index }: ReviewCardProps) {
  const initials = review.worker.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const dateStr = new Date(review.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-lg border border-border bg-white p-4 dark:bg-perch-dark/80 dark:border-stone-800"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {review.worker.avatarUrl ? (
          <Image
            src={review.worker.avatarUrl}
            alt={`${review.worker.name}'s avatar`}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-perch-primary-100 text-sm font-semibold text-perch-primary-700 dark:bg-perch-primary-950 dark:text-perch-primary-400">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">{review.worker.name}</p>
            <p className="shrink-0 text-xs text-muted-foreground">{dateStr}</p>
          </div>

          {/* Stars */}
          <div className="mt-0.5 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3.5",
                  i < review.overallRating
                    ? "fill-perch-primary-400 text-perch-primary-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          )}

          {/* Cafe response */}
          {review.cafeResponse && (
            <div className="mt-3 rounded-lg bg-perch-secondary-50/50 p-3 dark:bg-perch-secondary-950/20">
              <p className="flex items-center gap-1.5 text-xs font-medium text-perch-secondary-700 dark:text-perch-secondary-400">
                <MessageSquare className="size-3" />
                Response from cafe
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {review.cafeResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main component ── */

const REVIEWS_PER_PAGE = 10

type CafeReviewsProps = {
  reviews: ReviewWithAuthor[]
  avgRating: number
  totalReviews: number
}

function CafeReviews({ reviews, avgRating, totalReviews }: CafeReviewsProps) {
  const [showCount, setShowCount] = useState(REVIEWS_PER_PAGE)

  if (totalReviews === 0) {
    return (
      <section aria-label="Reviews">
        <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
          Reviews
        </h2>
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to review this cafe after your meeting!
        </p>
      </section>
    )
  }

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.overallRating === stars).length,
  }))

  // Attribute averages
  const avgAttr = (key: "wifiRating" | "noiseRating" | "spaceRating" | "staffRating") => {
    const vals = reviews.map((r) => r[key]).filter((v): v is number => v !== null)
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const visibleReviews = reviews.slice(0, showCount)
  const hasMore = showCount < reviews.length

  return (
    <section aria-label="Reviews">
      <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
        Reviews
      </h2>

      {/* Overview */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        {/* Rating breakdown */}
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-perch-dark/80 dark:border-stone-800">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4",
                      i < Math.round(avgRating)
                        ? "fill-perch-primary-400 text-perch-primary-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {distribution.map((d) => (
              <RatingBar key={d.stars} {...d} total={reviews.length} />
            ))}
          </div>
        </div>

        {/* Attribute ratings */}
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-perch-dark/80 dark:border-stone-800">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Detailed ratings
          </h3>
          <div className="space-y-3">
            <AttrRating
              icon={<Wifi className="size-4" />}
              label="WiFi"
              value={avgAttr("wifiRating")}
            />
            <AttrRating
              icon={<Volume2 className="size-4" />}
              label="Noise"
              value={avgAttr("noiseRating")}
            />
            <AttrRating
              icon={<Maximize className="size-4" />}
              label="Space"
              value={avgAttr("spaceRating")}
            />
            <AttrRating
              icon={<UserCheck className="size-4" />}
              label="Staff"
              value={avgAttr("staffRating")}
            />
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3">
        {visibleReviews.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setShowCount((c) => c + REVIEWS_PER_PAGE)}
          >
            Load more reviews
          </Button>
        </div>
      )}
    </section>
  )
}

export { CafeReviews }
export type { CafeReviewsProps }
