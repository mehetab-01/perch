import Anthropic from "@anthropic-ai/sdk"
import Groq from "groq-sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"

type ProviderFn = (
  userMessage: string,
  systemPrompt: string,
  maxTokens: number
) => Promise<string | null>

// ── Groq (fastest inference) ───────────────────────────────────────────────

const callGroq: ProviderFn = async (userMessage, systemPrompt, maxTokens) => {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const client = new Groq({ apiKey })
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: maxTokens,
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  })

  return response.choices[0]?.message?.content?.trim() ?? null
}

// ── Gemini (free tier, JSON mode) ──────────────────────────────────────────

const callGemini: ProviderFn = async (userMessage, systemPrompt, maxTokens) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0,
      maxOutputTokens: maxTokens,
    },
  })

  const result = await model.generateContent(userMessage)
  return result.response.text().trim()
}

// ── Claude (best quality) ──────────────────────────────────────────────────

const callClaude: ProviderFn = async (userMessage, systemPrompt, maxTokens) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") return null

  return textBlock.text.trim()
}

// ── Unified caller with fallback chain ─────────────────────────────────────
// Tries: Groq → Gemini → Claude. Returns first successful response.

async function callAI(
  userMessage: string,
  systemPrompt: string,
  maxTokens: number = 512
): Promise<string | null> {
  const providers: ProviderFn[] = [callGroq, callGemini, callClaude]

  for (const provider of providers) {
    try {
      const result = await provider(userMessage, systemPrompt, maxTokens)
      if (result) return result
    } catch {
      continue
    }
  }

  return null
}

export { callAI, callGroq, callGemini, callClaude }
export type { ProviderFn }
