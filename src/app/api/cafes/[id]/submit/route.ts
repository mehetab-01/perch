import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces } from "@/lib/db/schema"

type RouteParams = { params: Promise<{ id: string }> }

// POST /api/cafes/[id]/submit — submit cafe for verification
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, id), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!existing[0]) {
    return NextResponse.json({ error: "Cafe not found or not owned by you" }, { status: 404 })
  }

  // Verify cafe has at least one space
  const cafeSpaces = await db
    .select()
    .from(spaces)
    .where(eq(spaces.cafeId, id))
    .limit(1)

  if (cafeSpaces.length === 0) {
    return NextResponse.json(
      { error: "Please add at least one space before submitting" },
      { status: 400 }
    )
  }

  const result = await db
    .update(cafes)
    .set({ verificationStatus: "pending", updatedAt: new Date() })
    .where(eq(cafes.id, id))
    .returning()

  return NextResponse.json({ cafe: result[0], message: "Submitted for verification" })
}
