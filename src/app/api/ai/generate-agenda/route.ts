import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { generateAgenda } from "@/lib/ai/generate-agenda"

// ── Per-user rate limiter (20 AI generations/day) ────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

// ── Input validation ─────────────────────────────────────────────────────────
const agendaInputSchema = z.object({
  title: z.string().min(1).max(200),
  durationMinutes: z.number().int().min(15).max(480),
  attendees: z.number().int().min(1).max(20),
  context: z.string().max(500).optional(),
})

// ── POST handler ─────────────────────────────────────────────────────────────
async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 20 AI generations per day." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const parsed = agendaInputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const agenda = await generateAgenda(parsed.data)

    if (!agenda) {
      return NextResponse.json(
        { error: "Failed to generate agenda. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ agenda })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export { POST }
