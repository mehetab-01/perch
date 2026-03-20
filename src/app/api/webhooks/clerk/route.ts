import { type NextRequest, NextResponse } from "next/server"
import { verifyWebhook } from "@clerk/nextjs/webhooks"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

function getPrimaryEmail(data: {
  email_addresses: { email_address: string; id: string }[]
  primary_email_address_id: string | null
}): string | null {
  if (!data.primary_email_address_id) return null
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )
  return primary?.email_address ?? null
}

function buildName(firstName: string | null, lastName: string | null, fallback: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || fallback
}

export async function POST(req: NextRequest) {
  let event: WebhookEvent
  try {
    event = await verifyWebhook(req)
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "user.created": {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url, phone_numbers } =
          event.data

        const email = getPrimaryEmail({ email_addresses, primary_email_address_id })
        if (!email) {
          return NextResponse.json({ error: "No primary email found" }, { status: 400 })
        }

        await db.insert(users).values({
          id,
          email,
          name: buildName(first_name, last_name, email),
          avatarUrl: image_url || null,
          phone: phone_numbers?.[0]?.phone_number ?? null,
        })

        return NextResponse.json({ success: true }, { status: 201 })
      }

      case "user.updated": {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
          event.data

        const email = getPrimaryEmail({ email_addresses, primary_email_address_id })
        if (!email) {
          return NextResponse.json({ error: "No primary email found" }, { status: 400 })
        }

        await db
          .update(users)
          .set({
            email,
            name: buildName(first_name, last_name, email),
            avatarUrl: image_url || null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, id))

        return NextResponse.json({ success: true })
      }

      case "user.deleted": {
        const { id } = event.data
        if (id) {
          await db.delete(users).where(eq(users.id, id))
        }

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ received: true })
    }
  } catch (error) {
    console.error("Clerk webhook DB error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
