import { callAI } from "@/lib/ai/providers"

const NOTES_PROMPT = `You are a professional meeting notes assistant. Generate structured post-meeting notes from the provided details.

Format the notes with these sections:
1. **Meeting Summary** — 2-3 sentence overview of what was discussed
2. **Key Decisions** — Bulleted list of decisions made (if key points suggest any)
3. **Action Items** — Bulleted list with owner placeholders like "[Attendee]" when specific names aren't known
4. **Next Steps** — Brief note on follow-up or next meeting

Rules:
- Derive content from the title, agenda, and key points provided
- If key points are sparse, create reasonable notes based on the agenda and title
- Keep it professional and actionable
- Use bullet points (- ) for lists, not numbers
- Mark action items with "[ ]" checkbox style: "- [ ] Action item"
- Return ONLY the notes text. No extra commentary, no quotes around the output
- Use plain text section headers like "MEETING SUMMARY", "KEY DECISIONS", "ACTION ITEMS", "NEXT STEPS" (all caps, no markdown)`

type NotesInput = {
  title: string
  durationMinutes: number
  agenda?: string
  keyPoints?: string
}

async function generateNotes(input: NotesInput): Promise<string | null> {
  const { title, durationMinutes, agenda, keyPoints } = input

  if (!title.trim()) return null

  const parts = [
    `Meeting title: ${title}`,
    `Duration: ${durationMinutes} minutes`,
  ]

  if (agenda?.trim()) {
    parts.push(`Agenda:\n${agenda}`)
  }

  if (keyPoints?.trim()) {
    parts.push(`Key points / discussion notes:\n${keyPoints}`)
  }

  const userMessage = parts.join("\n\n")
  const result = await callAI(userMessage, NOTES_PROMPT, 800)
  return result
}

export { generateNotes }
export type { NotesInput }
