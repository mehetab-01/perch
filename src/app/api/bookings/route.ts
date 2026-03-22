import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and, gte, lte, not, inArray } from "drizzle-orm"
import crypto from "crypto"
import { db } from "@/lib/db"
import { bookings, payments, spaces, cafes, availability } from "@/lib/db/schema"
import { razorpay } from "@/lib/razorpay"
import { createBookingSchema } from "@/lib/validators/booking"
import { getBookingsByStatus } from "@/lib/queries/dashboard"
import { generateRecurringDates } from "@/lib/recurring"

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
  const seriesId = searchParams.get("series")

  const result = await getBookingsByStatus(userId, filtered, limit, offset, seriesId ?? undefined)
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

  // ── Generate dates (single or recurring) ──

  const isRecurring =
    data.isRecurring &&
    data.recurrencePattern &&
    data.recurrenceEndDate

  let datesToBook: string[] = [data.date]

  if (isRecurring) {
    // Get blocked dates for this space
    const blockedRows = await db
      .select({ blockedDate: availability.blockedDate })
      .from(availability)
      .where(eq(availability.spaceId, data.spaceId))

    const blockedDates = new Set(
      blockedRows
        .map((r) => r.blockedDate)
        .filter((d): d is string => d !== null)
    )

    datesToBook = generateRecurringDates(
      data.date,
      data.recurrencePattern!,
      data.recurrenceEndDate!,
      blockedDates
    )

    if (datesToBook.length < 2) {
      return NextResponse.json(
        { error: "Recurring booking must have at least 2 sessions" },
        { status: 400 }
      )
    }
  }

  // ── Check for overlapping bookings on ALL dates ──

  const conflictingDates: string[] = []
  for (const bookDate of datesToBook) {
    const overlapping = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.spaceId, data.spaceId),
          eq(bookings.date, bookDate),
          not(inArray(bookings.status, ["cancelled"])),
          lte(bookings.startTime, data.endTime),
          gte(bookings.endTime, data.startTime)
        )
      )
      .limit(1)

    if (overlapping.length > 0) {
      conflictingDates.push(bookDate)
    }
  }

  if (conflictingDates.length > 0) {
    return NextResponse.json(
      {
        error: isRecurring
          ? `Time slot already booked on: ${conflictingDates.join(", ")}`
          : "This time slot is already booked",
        conflictingDates,
      },
      { status: 409 }
    )
  }

  // ── Calculate amounts per session (all in paise) ──

  const spaceAmount = Math.round(space.pricePerHour * data.durationHours)
  const platformFee = Math.round(spaceAmount * PLATFORM_FEE_RATE)
  const gstAmount = Math.round((spaceAmount + platformFee) * GST_RATE)
  const perSessionTotal = spaceAmount + platformFee + gstAmount
  const perSessionPayout = spaceAmount - Math.round(spaceAmount * COMMISSION_RATE)

  const instanceCount = datesToBook.length
  const grandTotal = perSessionTotal * instanceCount
  const grandPlatformFee = platformFee * instanceCount
  const grandGst = gstAmount * instanceCount
  const grandPayout = perSessionPayout * instanceCount

  // ── Create bookings ──

  const recurringGroupId = isRecurring ? crypto.randomUUID() : null

  const createdBookingIds: string[] = []

  for (const bookDate of datesToBook) {
    const checkinToken = crypto.randomUUID()

    const [booking] = await db
      .insert(bookings)
      .values({
        workerId: userId,
        spaceId: data.spaceId,
        cafeId: data.cafeId,
        date: bookDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        numAttendees: data.numAttendees,
        meetingTitle: data.meetingTitle ?? null,
        agenda: data.agenda ?? null,
        status: "pending",
        checkinToken,
        totalAmount: perSessionTotal,
        platformFee,
        cafePayout: perSessionPayout,
        isRecurring: !!isRecurring,
        recurringGroupId,
        recurrencePattern: isRecurring ? data.recurrencePattern! : null,
        recurrenceEndDate: isRecurring ? data.recurrenceEndDate! : null,
      })
      .returning({ id: bookings.id })

    createdBookingIds.push(booking.id)
  }

  // ── Create a single Razorpay order for the total amount ──

  const primaryBookingId = createdBookingIds[0]!

  let order
  try {
    order = await razorpay.orders.create({
      amount: grandTotal,
      currency: "INR",
      receipt: primaryBookingId,
      notes: {
        bookingId: primaryBookingId,
        cafeId: data.cafeId,
        workerId: userId,
        spaceId: data.spaceId,
        ...(isRecurring
          ? {
              recurringGroupId: recurringGroupId!,
              instanceCount: String(instanceCount),
            }
          : {}),
      },
    })
  } catch (error) {
    // Clean up all created bookings on Razorpay failure
    for (const id of createdBookingIds) {
      await db.delete(bookings).where(eq(bookings.id, id))
    }
    console.error("Razorpay order creation failed:", error)
    return NextResponse.json(
      { error: "Payment service unavailable. Please try again." },
      { status: 502 }
    )
  }

  // ── Update all bookings with Razorpay order ID ──

  for (const id of createdBookingIds) {
    await db
      .update(bookings)
      .set({ razorpayOrderId: order.id })
      .where(eq(bookings.id, id))
  }

  // ── Create payment record (one for the primary booking) ──

  await db.insert(payments).values({
    bookingId: primaryBookingId,
    razorpayOrderId: order.id,
    amount: grandTotal,
    platformFee: grandPlatformFee,
    cafeAmount: grandPayout,
    gstAmount: grandGst,
    paymentStatus: "pending",
  })

  return NextResponse.json(
    {
      bookingId: primaryBookingId,
      bookingIds: createdBookingIds,
      orderId: order.id,
      amount: grandTotal,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID!,
      instanceCount,
      ...(isRecurring ? { recurringGroupId } : {}),
    },
    { status: 201 }
  )
}
