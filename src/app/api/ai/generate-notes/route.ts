import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { generateNotes } from "@/lib/ai/generate-notes"

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
const notesInputSchema = z.object({
  title: z.string().min(1).max(200),
  durationMinutes: z.number().int().min(15).max(480),
  agenda: z.string().max(2000).optional(),
  keyPoints: z.string().max(2000).optional(),
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
    const parsed = notesInputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const notes = await generateNotes(parsed.data)

    if (!notes) {
      return NextResponse.json(
        { error: "Failed to generate notes. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ notes })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export { POST }
