import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { eq, and, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { ids, all } = body as { ids?: string[]; all?: boolean }

  if (all) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )

    return NextResponse.json({ success: true })
  }

  if (Array.isArray(ids) && ids.length > 0) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          inArray(notifications.id, ids)
        )
      )

    return NextResponse.json({ success: true })
  }

  return NextResponse.json(
    { error: "Provide ids or all: true" },
    { status: 400 }
  )
}
