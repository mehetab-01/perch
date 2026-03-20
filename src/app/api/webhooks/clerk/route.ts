import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

type ClerkEmailAddress = {
  email_address: string
  id: string
}

type ClerkUserCreatedEvent = {
  type: "user.created"
  data: {
    id: string
    email_addresses: ClerkEmailAddress[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string
    phone_numbers: { phone_number: string }[]
  }
}

type ClerkEvent = ClerkUserCreatedEvent

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 }
    )
  }

  // Verify signature
  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  const body = await req.text()

  let event: ClerkEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true })
  }

  const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url, phone_numbers } =
    event.data

  const primaryEmail = email_addresses.find(
    (e) => e.id === primary_email_address_id
  )

  if (!primaryEmail) {
    return NextResponse.json({ error: "No primary email found" }, { status: 400 })
  }

  const name = [first_name, last_name].filter(Boolean).join(" ") || primaryEmail.email_address

  await db.insert(users).values({
    id,
    email: primaryEmail.email_address,
    name,
    avatarUrl: image_url || null,
    phone: phone_numbers[0]?.phone_number ?? null,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
