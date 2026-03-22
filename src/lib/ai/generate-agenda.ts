import { callAI } from "@/lib/ai/providers"

const AGENDA_PROMPT = `You are a professional meeting preparation assistant. Generate a structured meeting agenda based on the provided details.

Format the agenda as a numbered list with time allocations. Include:
1. A brief opening/introductions section
2. Main discussion points derived from the meeting title and context
3. Time allocations that fit within the total duration
4. An action items / wrap-up section at the end

Rules:
- Keep it professional but concise
- Time allocations must add up to the total duration
- Each agenda item should have a clear purpose
- If context is sparse, infer reasonable discussion points from the title
- Format time as "X min" (e.g., "10 min")
- Return ONLY the agenda text. No markdown headers, no extra commentary, no quotes around the output
- Use this format for each item: "1. [Topic] (X min)"
- Add a brief one-line description under each item`

type AgendaInput = {
  title: string
  durationMinutes: number
  attendees: number
  context?: string
}

async function generateAgenda(input: AgendaInput): Promise<string | null> {
  const { title, durationMinutes, attendees, context } = input

  if (!title.trim()) return null

  const parts = [
    `Meeting title: ${title}`,
    `Duration: ${durationMinutes} minutes`,
    `Attendees: ${attendees} ${attendees === 1 ? "person" : "people"}`,
  ]

  if (context?.trim()) {
    parts.push(`Additional context: ${context}`)
  }

  const userMessage = parts.join("\n")
  const result = await callAI(userMessage, AGENDA_PROMPT, 600)
  return result
}

export { generateAgenda }
export type { AgendaInput }
