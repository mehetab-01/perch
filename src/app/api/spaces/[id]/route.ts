import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces } from "@/lib/db/schema"
import { spaceUpdateSchema } from "@/lib/validators/space"

type RouteParams = { params: Promise<{ id: string }> }

// PATCH /api/spaces/[id] — update a space
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Get the space and verify ownership via cafe
  const space = await db.select().from(spaces).where(eq(spaces.id, id)).limit(1)
  if (!space[0]) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  const cafe = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, space[0].cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json({ error: "Not authorized to edit this space" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = spaceUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updateData = { ...parsed.data }
  // Convert price from ₹ to paise if provided
  if (updateData.pricePerHour !== undefined) {
    updateData.pricePerHour = Math.round(updateData.pricePerHour * 100)
  }

  const result = await db
    .update(spaces)
    .set(updateData)
    .where(eq(spaces.id, id))
    .returning()

  return NextResponse.json({ space: result[0] })
}

// DELETE /api/spaces/[id] — delete a space
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const space = await db.select().from(spaces).where(eq(spaces.id, id)).limit(1)
  if (!space[0]) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  const cafe = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, space[0].cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json({ error: "Not authorized to delete this space" }, { status: 403 })
  }

  await db.delete(spaces).where(eq(spaces.id, id))

  return NextResponse.json({ message: "Space deleted" })
}
