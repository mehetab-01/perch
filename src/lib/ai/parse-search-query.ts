import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { buildSearchPrompt } from "@/lib/ai/search-prompt"

const aiSearchFiltersSchema = z.object({
  city: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  people: z.number().int().min(1).max(20).nullable().optional(),
  amenities: z.array(z.string()).nullable().optional(),
  noiseLevel: z.enum(["quiet", "moderate", "lively"]).nullable().optional(),
  maxPricePerHour: z.number().nullable().optional(),
  sortBy: z.enum(["price_asc", "rating", "distance"]).nullable().optional(),
})

type AISearchFilters = z.infer<typeof aiSearchFiltersSchema>

async function parseSearchQuery(
  naturalLanguageQuery: string
): Promise<AISearchFilters | null> {
  const trimmed = naturalLanguageQuery.trim()

  // Skip AI for empty or very short queries
  if (!trimmed || trimmed.length < 5) {
    return null
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: buildSearchPrompt(),
      messages: [{ role: "user", content: trimmed }],
    })

    // Extract text from response
    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return null
    }

    const rawJson = textBlock.text.trim()
    const parsed = JSON.parse(rawJson) as unknown
    const validated = aiSearchFiltersSchema.safeParse(parsed)

    if (!validated.success) {
      return null
    }

    // Clean up: remove null/undefined fields
    const filters: AISearchFilters = {}
    const data = validated.data

    if (data.city) filters.city = data.city
    if (data.area) filters.area = data.area
    if (data.date) filters.date = data.date
    if (data.startTime) filters.startTime = data.startTime
    if (data.duration) filters.duration = data.duration
    if (data.people) filters.people = data.people
    if (data.amenities && data.amenities.length > 0) filters.amenities = data.amenities
    if (data.noiseLevel) filters.noiseLevel = data.noiseLevel
    if (data.maxPricePerHour) filters.maxPricePerHour = data.maxPricePerHour
    if (data.sortBy) filters.sortBy = data.sortBy

    return filters
  } catch {
    // If Claude API fails, return null to fall back to regular search
    return null
  }
}

export { parseSearchQuery, aiSearchFiltersSchema }
export type { AISearchFilters }
