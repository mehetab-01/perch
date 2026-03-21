import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { isAdmin } from "@/lib/queries/admin"

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

  const body = await req.json()
  const role = body.role as "worker" | "cafe_owner" | "admin"

  if (!["worker", "cafe_owner", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  // Prevent removing your own admin role
  if (id === userId && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 }
    )
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))

  return NextResponse.json({ success: true })
}
