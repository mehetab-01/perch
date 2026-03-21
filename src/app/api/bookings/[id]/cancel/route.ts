import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings } from "@/lib/db/schema"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
  }

  const body = await req.json()
  const rawReason = typeof body.reason === "string" ? body.reason.trim() : null
  const reason = rawReason ? rawReason.slice(0, 500) : null

  // Find the booking and verify ownership
  const [booking] = await db
    .select({ id: bookings.id, status: bookings.status })
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.workerId, userId)))
    .limit(1)

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return NextResponse.json(
      { error: "Only pending or confirmed bookings can be cancelled" },
      { status: 400 }
    )
  }

  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelReason: reason || null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))

  return NextResponse.json({ success: true })
}
