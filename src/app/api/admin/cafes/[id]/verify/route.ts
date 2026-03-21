import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes } from "@/lib/db/schema"
import { isAdmin } from "@/lib/queries/admin"
import { createNotification } from "@/lib/notifications"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hasAccess = await isAdmin(userId)
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid cafe ID" }, { status: 400 })
  }

  const body = await req.json()
  const status = body.status as "verified" | "rejected"

  if (status !== "verified" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const reason =
    status === "rejected" && typeof body.reason === "string"
      ? body.reason.trim().slice(0, 500)
      : null

  if (status === "rejected" && !reason) {
    return NextResponse.json(
      { error: "Rejection reason is required" },
      { status: 400 }
    )
  }

  // Fetch the cafe
  const [cafe] = await db
    .select({ id: cafes.id, name: cafes.name, ownerId: cafes.ownerId })
    .from(cafes)
    .where(eq(cafes.id, id))
    .limit(1)

  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
  }

  // Update verification status (+ activate on approval)
  await db
    .update(cafes)
    .set({
      verificationStatus: status,
      isActive: status === "verified",
      updatedAt: new Date(),
    })
    .where(eq(cafes.id, id))

  // Notify the cafe owner
  if (status === "verified") {
    await createNotification(
      cafe.ownerId,
      "payout_settled", // reusing type — closest match
      "Cafe approved!",
      `Your cafe "${cafe.name}" has been verified and is now live on Perch.`,
      { cafeId: cafe.id }
    )
  } else {
    await createNotification(
      cafe.ownerId,
      "booking_cancelled", // reusing type — closest match for negative
      "Cafe verification rejected",
      `Your cafe "${cafe.name}" was not approved. Reason: ${reason}`,
      { cafeId: cafe.id }
    )
  }

  return NextResponse.json({ success: true })
}
