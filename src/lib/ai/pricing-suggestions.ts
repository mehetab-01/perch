import { callAI } from "@/lib/ai/providers"
import type { BookingAnalyticsRow } from "@/lib/queries/cafe-dashboard"
import type { PricingSuggestionData } from "@/types/cafe-dashboard"

const PRICING_SYSTEM_PROMPT = `You are a pricing analyst for Perch, a cafe meeting space marketplace in India.
Analyze the booking data and suggest pricing adjustments to maximize the cafe owner's revenue.

Rules:
- Base currency is INR (Indian Rupees). All prices are in PAISE (1 rupee = 100 paise).
- Suggest SPECIFIC numbers — not vague "increase by some amount".
- Only suggest changes that are meaningful (at least 5% difference from current price).
- Consider demand patterns: high-occupancy slots can handle price increases, low-occupancy slots need discounts to fill.
- Weekend vs weekday patterns matter — business meetings cluster on weekdays.
- Morning (9-12), afternoon (12-17), and evening (17-21) slots behave differently.
- Be conservative — a 10-20% adjustment is reasonable, 30%+ needs strong justification.
- Each suggestion must reference a specific space by its spaceId and spaceName.

Return ONLY valid JSON with no markdown formatting, no backticks, no explanation outside the JSON:
{
  "suggestions": [
    {
      "timeSlot": "Weekday mornings 9-11am",
      "currentPrice": 50000,
      "suggestedPrice": 57500,
      "reason": "This slot has 85% occupancy — room to increase price by 15%",
      "expectedImpact": "Could increase monthly revenue by ₹3,000-5,000",
      "spaceId": "uuid-here",
      "spaceName": "Corner Booth"
    }
  ]
}

Generate 3-6 actionable suggestions. Focus on the highest-impact changes first.`

type TimeSlotStats = {
  slot: string
  bookingCount: number
  totalSlots: number
  occupancyRate: number
  avgDuration: number
  totalRevenue: number // paise
}

type SpaceAnalysis = {
  spaceId: string
  spaceName: string
  pricePerHour: number // paise
  totalBookings: number
  weekdayBookings: number
  weekendBookings: number
  totalRevenue: number // paise
  timeSlots: TimeSlotStats[]
}

function categorizeTimeSlot(startTime: string): string {
  const hour = parseInt(startTime.split(":")[0]!, 10)
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

function analyzeBookingData(
  rows: BookingAnalyticsRow[]
): SpaceAnalysis[] {
  const spaceMap = new Map<string, {
    spaceId: string
    spaceName: string
    pricePerHour: number
    bookings: BookingAnalyticsRow[]
  }>()

  for (const row of rows) {
    const existing = spaceMap.get(row.spaceId)
    if (existing) {
      existing.bookings.push(row)
    } else {
      spaceMap.set(row.spaceId, {
        spaceId: row.spaceId,
        spaceName: row.spaceName,
        pricePerHour: row.pricePerHour,
        bookings: [row],
      })
    }
  }

  const analyses: SpaceAnalysis[] = []

  for (const space of spaceMap.values()) {
    const weekdayBookings = space.bookings.filter(
      (b) => Number(b.dayOfWeek) >= 1 && Number(b.dayOfWeek) <= 5
    )
    const weekendBookings = space.bookings.filter(
      (b) => Number(b.dayOfWeek) === 0 || Number(b.dayOfWeek) === 6
    )

    // Analyze by time slot and day type
    const slotKeys = [
      "weekday_morning",
      "weekday_afternoon",
      "weekday_evening",
      "weekend_morning",
      "weekend_afternoon",
      "weekend_evening",
    ]

    const slotLabels: Record<string, string> = {
      weekday_morning: "Weekday mornings (9am-12pm)",
      weekday_afternoon: "Weekday afternoons (12-5pm)",
      weekday_evening: "Weekday evenings (5-9pm)",
      weekend_morning: "Weekend mornings (9am-12pm)",
      weekend_afternoon: "Weekend afternoons (12-5pm)",
      weekend_evening: "Weekend evenings (5-9pm)",
    }

    const timeSlots: TimeSlotStats[] = slotKeys.map((key) => {
      const isWeekend = key.startsWith("weekend")
      const timeOfDay = key.split("_")[1]!

      const slotBookings = space.bookings.filter((b) => {
        const dow = Number(b.dayOfWeek)
        const isWe = dow === 0 || dow === 6
        return isWe === isWeekend && categorizeTimeSlot(b.startTime) === timeOfDay
      })

      // 90 days → ~64 weekdays, ~26 weekend days. Each day has 3 slots.
      const daysInPeriod = isWeekend ? 26 : 64

      return {
        slot: slotLabels[key]!,
        bookingCount: slotBookings.length,
        totalSlots: daysInPeriod,
        occupancyRate: daysInPeriod > 0
          ? Math.round((slotBookings.length / daysInPeriod) * 100)
          : 0,
        avgDuration: slotBookings.length > 0
          ? slotBookings.reduce((sum, b) => sum + b.durationHours, 0) / slotBookings.length
          : 0,
        totalRevenue: slotBookings.reduce((sum, b) => sum + b.cafePayout, 0),
      }
    })

    analyses.push({
      spaceId: space.spaceId,
      spaceName: space.spaceName,
      pricePerHour: space.pricePerHour,
      totalBookings: space.bookings.length,
      weekdayBookings: weekdayBookings.length,
      weekendBookings: weekendBookings.length,
      totalRevenue: space.bookings.reduce((sum, b) => sum + b.cafePayout, 0),
      timeSlots,
    })
  }

  return analyses
}

function formatAnalysisForPrompt(analyses: SpaceAnalysis[]): string {
  return analyses
    .map((space) => {
      const priceRupees = (space.pricePerHour / 100).toFixed(0)
      const revenueRupees = (space.totalRevenue / 100).toFixed(0)

      let summary = `Space: "${space.spaceName}" (ID: ${space.spaceId})\n`
      summary += `  Current price: ₹${priceRupees}/hr (${space.pricePerHour} paise)\n`
      summary += `  Total bookings (90 days): ${space.totalBookings} (weekday: ${space.weekdayBookings}, weekend: ${space.weekendBookings})\n`
      summary += `  Total revenue: ₹${revenueRupees}\n`
      summary += `  Time slot breakdown:\n`

      for (const slot of space.timeSlots) {
        if (slot.bookingCount > 0) {
          summary += `    - ${slot.slot}: ${slot.bookingCount} bookings, `
          summary += `${slot.occupancyRate}% occupancy, `
          summary += `avg ${slot.avgDuration.toFixed(1)}h duration, `
          summary += `₹${(slot.totalRevenue / 100).toFixed(0)} revenue\n`
        } else {
          summary += `    - ${slot.slot}: 0 bookings (empty)\n`
        }
      }

      return summary
    })
    .join("\n")
}

async function generatePricingSuggestions(
  rows: BookingAnalyticsRow[]
): Promise<PricingSuggestionData[] | null> {
  if (rows.length < 20) return null

  const analyses = analyzeBookingData(rows)
  const formattedData = formatAnalysisForPrompt(analyses)

  const userMessage = `Here is the booking data for a cafe with ${rows.length} bookings over the last 90 days:\n\n${formattedData}\n\nGenerate pricing suggestions to maximize revenue.`

  const result = await callAI(userMessage, PRICING_SYSTEM_PROMPT, 1500)
  if (!result) return null

  try {
    // Strip any markdown code fences if present
    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(cleaned) as { suggestions: PricingSuggestionData[] }

    if (!Array.isArray(parsed.suggestions)) return null

    // Validate each suggestion has required fields
    return parsed.suggestions.filter(
      (s) =>
        typeof s.timeSlot === "string" &&
        typeof s.currentPrice === "number" &&
        typeof s.suggestedPrice === "number" &&
        typeof s.reason === "string" &&
        typeof s.expectedImpact === "string" &&
        typeof s.spaceId === "string" &&
        typeof s.spaceName === "string"
    )
  } catch {
    return null
  }
}

export { generatePricingSuggestions, analyzeBookingData }
