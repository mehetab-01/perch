import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { reviews, cafes } from "@/lib/db/schema"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const body = await req.json()
  const { response } = body as { response?: string }

  if (!response || typeof response !== "string" || response.trim().length === 0) {
    return NextResponse.json(
      { error: "Response text is required" },
      { status: 400 }
    )
  }

  if (response.length > 500) {
    return NextResponse.json(
      { error: "Response must be under 500 characters" },
      { status: 400 }
    )
  }

  // Get review
  const review = await db
    .select({ id: reviews.id, cafeId: reviews.cafeId })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1)

  if (!review[0]) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  // Verify cafe owner
  const cafe = await db
    .select({ id: cafes.id })
    .from(cafes)
    .where(and(eq(cafes.id, review[0].cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json(
      { error: "Not authorized to respond to this review" },
      { status: 403 }
    )
  }

  // Save response
  await db
    .update(reviews)
    .set({ cafeResponse: response.trim() })
    .where(eq(reviews.id, id))

  return NextResponse.json({ success: true })
}
