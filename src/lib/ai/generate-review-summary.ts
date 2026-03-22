import { callAI } from "@/lib/ai/providers"
import type { Review } from "@/lib/db/schema"

const REVIEW_SUMMARY_PROMPT = `You summarize meeting space reviews for professionals deciding where to book their next meeting.

Write a 2-3 sentence summary that sounds like a helpful friend's honest opinion. Focus on:
- WiFi reliability and speed
- Noise level and ambiance
- Space quality and comfort
- Staff friendliness
- Value for money

Be specific — mention actual patterns ("WiFi drops during peak hours", "great for small teams but cramped for 6+"). Include both positives and common concerns. Don't use bullet points, marketing language, or start with "This cafe". Write naturally.

Return ONLY the summary text. No quotes, no labels, no markdown.`

function formatReviewsForPrompt(reviewData: ReviewForSummary[]): string {
  return reviewData
    .map((r, i) => {
      const parts = [`Review ${i + 1}: ${r.overallRating}/5 stars`]
      if (r.wifiRating) parts.push(`WiFi: ${r.wifiRating}/5`)
      if (r.noiseRating) parts.push(`Noise: ${r.noiseRating}/5`)
      if (r.spaceRating) parts.push(`Space: ${r.spaceRating}/5`)
      if (r.staffRating) parts.push(`Staff: ${r.staffRating}/5`)
      if (r.comment) parts.push(`"${r.comment}"`)
      return parts.join(" | ")
    })
    .join("\n")
}

type ReviewForSummary = Pick<
  Review,
  "overallRating" | "wifiRating" | "noiseRating" | "spaceRating" | "staffRating" | "comment"
>

async function generateReviewSummary(
  reviews: ReviewForSummary[]
): Promise<string | null> {
  if (reviews.length < 3) return null

  // Take last 20 reviews (most recent)
  const recent = reviews.slice(-20)
  const formatted = formatReviewsForPrompt(recent)
  const userMessage = `Here are ${recent.length} reviews for a cafe meeting space:\n\n${formatted}`

  const summary = await callAI(userMessage, REVIEW_SUMMARY_PROMPT, 200)
  return summary
}

export { generateReviewSummary }
export type { ReviewForSummary }
