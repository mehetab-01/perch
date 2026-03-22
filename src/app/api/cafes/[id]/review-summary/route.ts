import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, reviews } from "@/lib/db/schema"
import { generateReviewSummary } from "@/lib/ai/generate-review-summary"

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

type RouteContext = { params: Promise<{ id: string }> }

async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params

  // Fetch cafe with summary cache fields
  const [cafe] = await db
    .select({
      id: cafes.id,
      totalReviews: cafes.totalReviews,
      reviewSummary: cafes.reviewSummary,
      reviewSummaryUpdatedAt: cafes.reviewSummaryUpdatedAt,
    })
    .from(cafes)
    .where(eq(cafes.id, id))
    .limit(1)

  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
  }

  // Need at least 3 reviews for a meaningful summary
  if (cafe.totalReviews < 3) {
    return NextResponse.json({
      summary: null,
      updatedAt: null,
      reviewCount: cafe.totalReviews,
    })
  }

  // Check if cached summary is still fresh
  const isFresh =
    cafe.reviewSummary &&
    cafe.reviewSummaryUpdatedAt &&
    Date.now() - cafe.reviewSummaryUpdatedAt.getTime() < STALE_AFTER_MS

  if (isFresh) {
    return NextResponse.json({
      summary: cafe.reviewSummary,
      updatedAt: cafe.reviewSummaryUpdatedAt!.toISOString(),
      reviewCount: cafe.totalReviews,
    })
  }

  // Fetch reviews and generate new summary
  const cafeReviews = await db
    .select({
      overallRating: reviews.overallRating,
      wifiRating: reviews.wifiRating,
      noiseRating: reviews.noiseRating,
      spaceRating: reviews.spaceRating,
      staffRating: reviews.staffRating,
      comment: reviews.comment,
    })
    .from(reviews)
    .where(and(eq(reviews.cafeId, id), eq(reviews.isVisible, true)))
    .orderBy(reviews.createdAt)
    .limit(20)

  const summary = await generateReviewSummary(cafeReviews)

  if (summary) {
    // Cache the summary in the cafes table
    const now = new Date()
    await db
      .update(cafes)
      .set({ reviewSummary: summary, reviewSummaryUpdatedAt: now })
      .where(eq(cafes.id, id))

    return NextResponse.json({
      summary,
      updatedAt: now.toISOString(),
      reviewCount: cafe.totalReviews,
    })
  }

  // AI generation failed — return cached summary if any, or null
  return NextResponse.json({
    summary: cafe.reviewSummary ?? null,
    updatedAt: cafe.reviewSummaryUpdatedAt?.toISOString() ?? null,
    reviewCount: cafe.totalReviews,
  })
}

export { GET }
