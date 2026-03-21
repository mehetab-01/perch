import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces } from "@/lib/db/schema"
import { spaceSchema } from "@/lib/validators/space"

// POST /api/spaces — create a space within a cafe
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = spaceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Verify user owns the cafe
  const cafe = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, parsed.data.cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json({ error: "Cafe not found or not owned by you" }, { status: 404 })
  }

  const result = await db
    .insert(spaces)
    .values({
      cafeId: parsed.data.cafeId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      capacityMin: parsed.data.capacityMin,
      capacityMax: parsed.data.capacityMax,
      pricePerHour: Math.round(parsed.data.pricePerHour * 100), // ₹ → paise
      noiseLevel: parsed.data.noiseLevel,
      amenities: parsed.data.amenities,
      photos: parsed.data.photos,
      isActive: true,
    })
    .returning()

  return NextResponse.json({ space: result[0] }, { status: 201 })
}
