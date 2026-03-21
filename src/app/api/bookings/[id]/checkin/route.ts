import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, cafes } from "@/lib/db/schema"

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
  const { checkinToken } = body as { checkinToken?: string }

  if (!checkinToken || typeof checkinToken !== "string") {
    return NextResponse.json(
      { error: "checkinToken is required" },
      { status: 400 }
    )
  }

  // Get booking and verify ownership
  const booking = await db
    .select({
      id: bookings.id,
      cafeId: bookings.cafeId,
      status: bookings.status,
      checkinToken: bookings.checkinToken,
    })
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking[0]) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Verify cafe owner owns this booking's cafe
  const cafe = await db
    .select({ id: cafes.id })
    .from(cafes)
    .where(and(eq(cafes.id, booking[0].cafeId), eq(cafes.ownerId, userId)))
    .limit(1)

  if (!cafe[0]) {
    return NextResponse.json(
      { error: "Not authorized for this booking" },
      { status: 403 }
    )
  }

  // Booking must be confirmed or pending
  if (booking[0].status !== "confirmed" && booking[0].status !== "pending") {
    return NextResponse.json(
      { error: `Cannot check in a booking with status: ${booking[0].status}` },
      { status: 400 }
    )
  }

  // Verify token matches
  if (booking[0].checkinToken !== checkinToken.trim()) {
    return NextResponse.json(
      { error: "Invalid check-in token" },
      { status: 400 }
    )
  }

  // Update status
  await db
    .update(bookings)
    .set({ status: "checked_in", updatedAt: new Date() })
    .where(eq(bookings.id, id))

  return NextResponse.json({ success: true })
}
