import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces, availability } from "@/lib/db/schema"
import { availabilityBatchSchema } from "@/lib/validators/availability"

// POST /api/availability — set availability for a space (replaces existing)
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = availabilityBatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Verify ownership: space → cafe → owner
  const space = await db
    .select()
    .from(spaces)
    .where(eq(spaces.id, parsed.data.spaceId))
    .limit(1)

  if (!space[0]) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  const cafe = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, space[0].cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  // Delete existing recurring availability for this space
  await db
    .delete(availability)
    .where(and(eq(availability.spaceId, parsed.data.spaceId), eq(availability.isRecurring, true)))

  // Insert new slots
  const slots = parsed.data.slots.map((slot) => ({
    spaceId: parsed.data.spaceId,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isRecurring: true,
  }))

  const result = await db.insert(availability).values(slots).returning()

  return NextResponse.json({ availability: result }, { status: 201 })
}
