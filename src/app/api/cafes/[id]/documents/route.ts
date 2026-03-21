import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes } from "@/lib/db/schema"
import { cafeDocumentsSchema } from "@/lib/validators/cafe"

type RouteParams = { params: Promise<{ id: string }> }

// POST /api/cafes/[id]/documents — upload verification documents
export async function POST(req: NextRequest, { params }: RouteParams) {
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

  const body = await req.json()
  const parsed = cafeDocumentsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updateData: Record<string, string | null> = { updatedAt: new Date().toISOString() }
  if (parsed.data.gstNumber) updateData.gstNumber = parsed.data.gstNumber
  if (parsed.data.fssaiLicenseUrl) updateData.fssaiLicenseUrl = parsed.data.fssaiLicenseUrl

  const result = await db
    .update(cafes)
    .set(updateData)
    .where(eq(cafes.id, id))
    .returning()

  return NextResponse.json({ cafe: result[0] })
}
