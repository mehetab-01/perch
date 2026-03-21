import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes } from "@/lib/db/schema"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership
  const cafe = await db
    .select({ id: cafes.id, isActive: cafes.isActive })
    .from(cafes)
    .where(and(eq(cafes.id, id), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json(
      { error: "Cafe not found or not owned by you" },
      { status: 404 }
    )
  }

  // Toggle active state
  await db
    .update(cafes)
    .set({ isActive: !cafe[0].isActive, updatedAt: new Date() })
    .where(eq(cafes.id, id))

  return NextResponse.json({
    success: true,
    isActive: !cafe[0].isActive,
  })
}
