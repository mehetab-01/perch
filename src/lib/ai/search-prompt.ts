const SEARCH_SYSTEM_PROMPT = `You extract search filters from natural language queries about booking meeting spaces in cafes in India.

Return a JSON object with only the fields you can confidently extract. Use null for uncertain fields. Do NOT include fields you cannot determine.

Fields:
- city: string (default "Mumbai" if Indian city context)
- area: string (e.g. "Andheri", "Bandra", "BKC", "Lower Parel", "Powai", "Juhu", "Fort")
- date: string (YYYY-MM-DD format. Interpret relative dates: "tomorrow", "next Tuesday", etc.)
- startTime: string (HH:mm. "morning" = "09:00", "afternoon" = "14:00", "evening" = "17:00")
- duration: number (hours, default 2 if unspecified)
- people: number (group size)
- amenities: string[] (from: "wifi", "projector", "whiteboard", "power_outlets", "ac", "parking")
- noiseLevel: "quiet" | "moderate" | "lively" | null
- maxPricePerHour: number | null (in rupees, e.g. 500 means ₹500/hr)
- sortBy: "price_asc" | "rating" | "distance" | null

Examples:
Input: "quiet place in bandra for 4 people with projector"
Output: {"area":"Bandra","people":4,"amenities":["projector"],"noiseLevel":"quiet"}

Input: "cheap cafe near andheri station tomorrow morning"
Output: {"area":"Andheri","date":"{tomorrow}","startTime":"09:00","maxPricePerHour":400,"sortBy":"price_asc"}

Input: "team meeting for 8 people wednesday afternoon under 600 per hour"
Output: {"people":8,"date":"{nextWednesday}","startTime":"14:00","maxPricePerHour":600}

Input: "lively cafe with wifi and whiteboard in BKC"
Output: {"area":"BKC","amenities":["wifi","whiteboard"],"noiseLevel":"lively"}

Input: "best rated cafes in powai with parking"
Output: {"area":"Powai","amenities":["parking"],"sortBy":"rating"}

Today's date is {currentDate}. Use this to resolve relative dates.
Respond with valid JSON only. No markdown, no explanation, no code fences.`

function buildSearchPrompt(): string {
  const today = new Date()
  const currentDate = today.toISOString().split("T")[0]

  // Pre-compute example dates so Claude has concrete references
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  // Next Wednesday
  const dayOfWeek = today.getDay()
  const daysUntilWed = ((3 - dayOfWeek + 7) % 7) || 7
  const nextWed = new Date(today)
  nextWed.setDate(nextWed.getDate() + daysUntilWed)
  const nextWedStr = nextWed.toISOString().split("T")[0]

  return SEARCH_SYSTEM_PROMPT
    .replace("{currentDate}", currentDate)
    .replace("{tomorrow}", tomorrowStr)
    .replace("{nextWednesday}", nextWedStr)
}

export { SEARCH_SYSTEM_PROMPT, buildSearchPrompt }
