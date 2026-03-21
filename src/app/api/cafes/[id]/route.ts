import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes } from "@/lib/db/schema"
import { cafeDetailsSchema } from "@/lib/validators/cafe"

type RouteParams = { params: Promise<{ id: string }> }

// PATCH /api/cafes/[id] — update cafe details
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  // Verify ownership
  const existing = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.id, id), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!existing[0]) {
    return NextResponse.json({ error: "Cafe not found or not owned by you" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = cafeDetailsSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const result = await db
    .update(cafes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(cafes.id, id))
    .returning()

  return NextResponse.json({ cafe: result[0] })
}

// GET /api/cafes/[id]
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const result = await db.select().from(cafes).where(eq(cafes.id, id)).limit(1)

  if (!result[0]) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
  }

  return NextResponse.json({ cafe: result[0] })
}
