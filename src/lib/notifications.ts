import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

export type NotificationType =
  | "booking_confirmed"
  | "new_booking"
  | "booking_cancelled"
  | "review_received"
  | "payout_settled"
  | "reminder"

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  content: string,
  metadata?: Record<string, string>
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      content,
      metadata: metadata ?? null,
    })
    .returning()

  return notification
}
