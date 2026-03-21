import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, users } from "@/lib/db/schema"
import { cafeDetailsSchema, generateSlug } from "@/lib/validators/cafe"

// POST /api/cafes — create a new cafe
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify user exists
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = cafeDetailsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, description, address, city, latitude, longitude } = parsed.data
  const slug = generateSlug(name)

  const result = await db
    .insert(cafes)
    .values({
      ownerId: userId,
      name,
      slug,
      description: description ?? null,
      address,
      city,
      latitude,
      longitude,
      verificationStatus: "pending",
      isActive: false,
    })
    .returning()

  // Update user role to cafe_owner if they were a worker
  if (user[0].role === "worker") {
    await db.update(users).set({ role: "cafe_owner" }).where(eq(users.id, userId))
  }

  return NextResponse.json({ cafe: result[0] }, { status: 201 })
}

// GET /api/cafes — get cafes owned by current user
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await db
    .select()
    .from(cafes)
    .where(eq(cafes.ownerId, userId))

  return NextResponse.json({ cafes: result })
}
