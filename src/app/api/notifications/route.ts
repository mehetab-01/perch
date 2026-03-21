import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, desc, sql, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [items, unreadResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20),
    db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      ),
  ])

  return NextResponse.json({
    notifications: items,
    unreadCount: Number(unreadResult[0]?.count ?? 0),
  })
}
