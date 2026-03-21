import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and, gte, lte, not, inArray } from "drizzle-orm"
import crypto from "crypto"
import { db } from "@/lib/db"
import { bookings, payments, spaces, cafes } from "@/lib/db/schema"
import { razorpay } from "@/lib/razorpay"
import { createBookingSchema } from "@/lib/validators/booking"
import { getBookingsByStatus } from "@/lib/queries/dashboard"

// ── GET /api/bookings — list bookings by status ──

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const statuses = searchParams.getAll("status")

  if (statuses.length === 0) {
    return NextResponse.json(
      { error: "At least one status parameter is required" },
      { status: 400 }
    )
  }

  const validStatuses = ["pending", "confirmed", "checked_in", "completed", "cancelled"]
  const filtered = statuses.filter((s) => validStatuses.includes(s))

  if (filtered.length === 0) {
    return NextResponse.json(
      { error: "Invalid status values" },
      { status: 400 }
    )
  }

  const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10)
  const rawOffset = parseInt(searchParams.get("offset") ?? "0", 10)
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 20 : rawLimit, 1), 100)
  const offset = Math.max(Number.isNaN(rawOffset) ? 0 : rawOffset, 0)

  const result = await getBookingsByStatus(userId, filtered, limit, offset)
  return NextResponse.json(result)
}

// ── POST /api/bookings — create booking + Razorpay order ──

const PLATFORM_FEE_RATE = 0.05 // 5% convenience fee
const GST_RATE = 0.18 // 18% GST
const COMMISSION_RATE = 0.12 // 12% platform commission from cafe payout

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // ── Verify space exists and belongs to the cafe ──

  const [space] = await db
    .select({
      id: spaces.id,
      cafeId: spaces.cafeId,
      pricePerHour: spaces.pricePerHour,
      isActive: spaces.isActive,
      capacityMin: spaces.capacityMin,
      capacityMax: spaces.capacityMax,
    })
    .from(spaces)
    .where(and(eq(spaces.id, data.spaceId), eq(spaces.cafeId, data.cafeId)))
    .limit(1)

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  if (!space.isActive) {
    return NextResponse.json(
      { error: "This space is no longer available" },
      { status: 400 }
    )
  }

  // ── Verify cafe is verified and active ──

  const [cafe] = await db
    .select({
      id: cafes.id,
      verificationStatus: cafes.verificationStatus,
      isActive: cafes.isActive,
    })
    .from(cafes)
    .where(eq(cafes.id, data.cafeId))
    .limit(1)

  if (!cafe) {
    return NextResponse.json({ error: "Cafe not found" }, { status: 404 })
  }

  if (cafe.verificationStatus !== "verified" || !cafe.isActive) {
    return NextResponse.json(
      { error: "This cafe is not accepting bookings" },
      { status: 400 }
    )
  }

  // ── Validate capacity ──

  if (data.numAttendees < space.capacityMin || data.numAttendees > space.capacityMax) {
    return NextResponse.json(
      {
        error: `This space accommodates ${space.capacityMin}-${space.capacityMax} people`,
      },
      { status: 400 }
    )
  }

  // ── Validate date is not in the past ──

  const bookingDate = new Date(data.date + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (bookingDate < today) {
    return NextResponse.json(
      { error: "Cannot book a date in the past" },
      { status: 400 }
    )
  }

  // ── Check for overlapping bookings ──

  const overlapping = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.spaceId, data.spaceId),
        eq(bookings.date, data.date),
        not(inArray(bookings.status, ["cancelled"])),
        // Time overlap: existing.start < new.end AND existing.end > new.start
        lte(bookings.startTime, data.endTime),
        gte(bookings.endTime, data.startTime)
      )
    )
    .limit(1)

  if (overlapping.length > 0) {
    return NextResponse.json(
      { error: "This time slot is already booked" },
      { status: 409 }
    )
  }

  // ── Calculate amounts (all in paise) ──

  const spaceAmount = Math.round(space.pricePerHour * data.durationHours)
  const platformFee = Math.round(spaceAmount * PLATFORM_FEE_RATE)
  const gstAmount = Math.round((spaceAmount + platformFee) * GST_RATE)
  const totalAmount = spaceAmount + platformFee + gstAmount
  const cafePayout = spaceAmount - Math.round(spaceAmount * COMMISSION_RATE)

  // ── Create booking ──

  const checkinToken = crypto.randomUUID()

  const [booking] = await db
    .insert(bookings)
    .values({
      workerId: userId,
      spaceId: data.spaceId,
      cafeId: data.cafeId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      durationHours: data.durationHours,
      numAttendees: data.numAttendees,
      meetingTitle: data.meetingTitle ?? null,
      agenda: data.agenda ?? null,
      status: "pending",
      checkinToken,
      totalAmount,
      platformFee,
      cafePayout,
    })
    .returning({ id: bookings.id })

  // ── Create Razorpay order ──

  let order
  try {
    order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: booking.id,
      notes: {
        bookingId: booking.id,
        cafeId: data.cafeId,
        workerId: userId,
        spaceId: data.spaceId,
      },
    })
  } catch (error) {
    // Clean up the booking if Razorpay order creation fails
    await db.delete(bookings).where(eq(bookings.id, booking.id))
    console.error("Razorpay order creation failed:", error)
    return NextResponse.json(
      { error: "Payment service unavailable. Please try again." },
      { status: 502 }
    )
  }

  // ── Update booking with Razorpay order ID ──

  await db
    .update(bookings)
    .set({ razorpayOrderId: order.id })
    .where(eq(bookings.id, booking.id))

  // ── Create payment record ──

  await db.insert(payments).values({
    bookingId: booking.id,
    razorpayOrderId: order.id,
    amount: totalAmount,
    platformFee,
    cafeAmount: cafePayout,
    gstAmount,
    paymentStatus: "pending",
  })

  return NextResponse.json(
    {
      bookingId: booking.id,
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID!,
    },
    { status: 201 }
  )
}
