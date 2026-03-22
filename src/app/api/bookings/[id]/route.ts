import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { bookings } from "@/lib/db/schema"

const patchSchema = z.object({
  agenda: z.string().max(2000).optional(),
})

// ── PATCH — update booking fields (e.g., save AI-generated agenda) ───────────
async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await db
      .update(bookings)
      .set({
        agenda: parsed.data.agenda,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, id), eq(bookings.workerId, userId)))
      .returning({ id: bookings.id })

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export { PATCH }
