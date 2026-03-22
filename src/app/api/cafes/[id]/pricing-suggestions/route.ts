import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces } from "@/lib/db/schema"
import {
  getBookingAnalytics,
  getBookingCount,
  getCachedPricingSuggestions,
  savePricingSuggestionsCache,
} from "@/lib/queries/cafe-dashboard"
import { generatePricingSuggestions } from "@/lib/ai/pricing-suggestions"
import type { PricingSuggestionsResponse } from "@/types/cafe-dashboard"

type RouteParams = { params: Promise<{ id: string }> }

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// GET /api/cafes/[id]/pricing-suggestions
export async function GET(_req: Request, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership
  const cafe = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, id), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json(
      { error: "Cafe not found or not owned by you" },
      { status: 404 }
    )
  }

  // Check cache — return if still valid (< 7 days old)
  const cached = await getCachedPricingSuggestions(id)
  if (cached) {
    const cacheAge = Date.now() - new Date(cached.generatedAt).getTime()
    if (cacheAge < CACHE_DURATION_MS) {
      const count = await getBookingCount(id)
      const response: PricingSuggestionsResponse = {
        suggestions: cached.suggestions,
        generatedAt: cached.generatedAt,
        totalBookingsAnalyzed: count,
      }
      return NextResponse.json(response)
    }
  }

  // Fetch booking analytics
  const { rows, totalBookings } = await getBookingAnalytics(id)

  // Require minimum 20 bookings
  if (totalBookings < 20) {
    return NextResponse.json(
      {
        error: "Not enough data",
        message: `Need at least 20 bookings to generate insights. You have ${totalBookings}.`,
        totalBookings,
      },
      { status: 422 }
    )
  }

  // Generate suggestions via AI
  const suggestions = await generatePricingSuggestions(rows)
  if (!suggestions || suggestions.length === 0) {
    return NextResponse.json(
      { error: "Failed to generate pricing suggestions. Try again later." },
      { status: 500 }
    )
  }

  // Validate that spaceIds in suggestions actually belong to this cafe
  const cafeSpaces = await db
    .select({ id: spaces.id })
    .from(spaces)
    .where(eq(spaces.cafeId, id))

  const validSpaceIds = new Set(cafeSpaces.map((s) => s.id))
  const validSuggestions = suggestions.filter((s) =>
    validSpaceIds.has(s.spaceId)
  )

  const generatedAt = new Date().toISOString()

  // Cache the results
  await savePricingSuggestionsCache(id, {
    suggestions: validSuggestions,
    generatedAt,
  })

  const response: PricingSuggestionsResponse = {
    suggestions: validSuggestions,
    generatedAt,
    totalBookingsAnalyzed: totalBookings,
  }

  return NextResponse.json(response)
}
