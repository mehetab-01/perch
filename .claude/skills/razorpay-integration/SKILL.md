# Razorpay Integration for Perch

## Order Creation (Server-side)
```ts
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create order before checkout
const order = await razorpay.orders.create({
  amount: totalAmountInPaise, // ₹800 = 80000 paise
  currency: "INR",
  receipt: `booking_${bookingId}`,
  notes: { bookingId, cafeId, workerId },
})
```

## Webhook Verification (CRITICAL)
```ts
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature")!

  const isValid = validateWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 })

  const event = JSON.parse(body)
  // Handle event.event: "payment.captured", "payment.failed", "refund.processed"
}
```

## Payment Flow
1. Worker selects space + time → frontend calls POST /api/bookings
2. API creates booking (status: pending) + Razorpay order
3. Frontend opens Razorpay checkout with order ID
4. On success → Razorpay webhook fires → API updates booking to "confirmed"
5. On meeting complete → API triggers Razorpay Transfer to cafe's linked account
