import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = { title: "Reviews" }
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getOwnedCafe,
  getCafeReviews,
  getCafeReviewStats,
} from "@/lib/queries/cafe-dashboard"
import { CafeReviewsClient } from "@/components/cafe-dashboard/reviews-client"

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
    </div>
  )
}

async function ReviewsContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cafe = await getOwnedCafe(userId)
  if (!cafe) redirect("/onboarding")

  const [reviews, reviewStats] = await Promise.all([
    getCafeReviews(cafe.id),
    getCafeReviewStats(cafe.id),
  ])

  return (
    <CafeReviewsClient reviews={reviews} stats={reviewStats} />
  )
}

function CafeReviewsPage() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <ReviewsContent />
    </Suspense>
  )
}

export default CafeReviewsPage
