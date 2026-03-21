import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getBookingsByStatus } from "@/lib/queries/dashboard"

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

  const bookings = await getBookingsByStatus(userId, filtered, limit, offset)
  return NextResponse.json(bookings)
}
