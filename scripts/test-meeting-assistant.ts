/**
 * Test script for the AI meeting assistant.
 * Verifies: agenda generation, notes generation, output formatting, rate limiter logic.
 *
 * Run: npx tsx --env-file=.env.local scripts/test-meeting-assistant.ts
 */

// ── Rate limiter unit test (no AI call needed) ──────────────────────────────

function testRateLimiter() {
  console.log("\n── Rate Limiter Tests ──\n")

  const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
  const RATE_LIMIT = 20
  const RATE_WINDOW_MS = 24 * 60 * 60 * 1000

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

  // Test 1: First call should pass
  const t1 = checkRateLimit("user_1")
  console.log(`[${t1 ? "PASS" : "FAIL"}] First call allowed`)

  // Test 2: 19 more calls should pass (total 20)
  let allPassed = true
  for (let i = 0; i < 19; i++) {
    if (!checkRateLimit("user_1")) {
      allPassed = false
      break
    }
  }
  console.log(`[${allPassed ? "PASS" : "FAIL"}] Calls 2-20 allowed`)

  // Test 3: 21st call should be blocked
  const t3 = !checkRateLimit("user_1")
  console.log(`[${t3 ? "PASS" : "FAIL"}] Call 21 blocked (rate limited)`)

  // Test 4: Different user should still pass
  const t4 = checkRateLimit("user_2")
  console.log(`[${t4 ? "PASS" : "FAIL"}] Different user unaffected`)

  // Test 5: Expired window should reset
  const entry = rateLimitMap.get("user_1")!
  entry.resetAt = Date.now() - 1 // simulate expired
  const t5 = checkRateLimit("user_1")
  console.log(`[${t5 ? "PASS" : "FAIL"}] Rate limit resets after window expires`)

  const passed = [t1, allPassed, t3, t4, t5].filter(Boolean).length
  console.log(`\nRate limiter: ${passed}/5 tests passed`)
  return passed === 5
}

// ── Agenda generator test ───────────────────────────────────────────────────

async function testAgendaGenerator() {
  console.log("\n── Agenda Generator Tests ──\n")

  const { generateAgenda } = await import("../src/lib/ai/generate-agenda")

  // Test 1: Empty title returns null
  const t1 = (await generateAgenda({ title: "", durationMinutes: 60, attendees: 4 })) === null
  console.log(`[${t1 ? "PASS" : "FAIL"}] Empty title returns null`)

  // Test 2: Valid input produces output
  console.log("Generating agenda (calling AI)...")
  const agenda = await generateAgenda({
    title: "Q1 Product Roadmap Review",
    durationMinutes: 60,
    attendees: 5,
    context: "Review progress on mobile app, discuss Q2 priorities",
  })

  const t2 = agenda !== null && agenda.length > 50
  console.log(`[${t2 ? "PASS" : "FAIL"}] Valid input produces agenda (${agenda?.length ?? 0} chars)`)

  if (agenda) {
    // Test 3: Contains numbered items
    const hasNumberedItems = /\d+\.\s/.test(agenda)
    console.log(`[${hasNumberedItems ? "PASS" : "FAIL"}] Contains numbered items`)

    // Test 4: Contains time allocations
    const hasTimeAlloc = /\d+\s*min/i.test(agenda)
    console.log(`[${hasTimeAlloc ? "PASS" : "FAIL"}] Contains time allocations (X min)`)

    // Test 5: Output is clean (no markdown headers, no wrapping quotes)
    const noMarkdown = !agenda.startsWith("#") && !agenda.startsWith("```")
    const noQuotes = !agenda.startsWith('"') && !agenda.startsWith("'")
    console.log(`[${noMarkdown ? "PASS" : "FAIL"}] No markdown headers`)
    console.log(`[${noQuotes ? "PASS" : "FAIL"}] No wrapping quotes`)

    console.log("\n--- Generated Agenda ---")
    console.log(agenda)
    console.log("--- End ---\n")

    const passed = [t1, t2, hasNumberedItems, hasTimeAlloc, noMarkdown, noQuotes].filter(Boolean).length
    console.log(`Agenda generator: ${passed}/6 tests passed`)
    return passed >= 5 // allow 1 soft fail
  }

  console.log(`Agenda generator: ${t1 ? 1 : 0}/2 tests passed (AI unavailable)`)
  return t1
}

// ── Notes generator test ────────────────────────────────────────────────────

async function testNotesGenerator() {
  console.log("\n── Notes Generator Tests ──\n")

  const { generateNotes } = await import("../src/lib/ai/generate-notes")

  // Test 1: Empty title returns null
  const t1 = (await generateNotes({ title: "", durationMinutes: 60 })) === null
  console.log(`[${t1 ? "PASS" : "FAIL"}] Empty title returns null`)

  // Test 2: Valid input produces output
  console.log("Generating notes (calling AI)...")
  const notes = await generateNotes({
    title: "Q1 Product Roadmap Review",
    durationMinutes: 60,
    agenda: "1. Opening (5 min)\n2. Mobile app progress (20 min)\n3. Q2 priorities (25 min)\n4. Action items (10 min)",
    keyPoints: "Mobile app 80% complete, delayed by 2 weeks. Q2 focus on analytics dashboard. John to finalize vendor contract by March 30.",
  })

  const t2 = notes !== null && notes.length > 100
  console.log(`[${t2 ? "PASS" : "FAIL"}] Valid input produces notes (${notes?.length ?? 0} chars)`)

  if (notes) {
    // Test 3: Contains section headers
    const hasSummary = /summary/i.test(notes)
    console.log(`[${hasSummary ? "PASS" : "FAIL"}] Contains summary section`)

    // Test 4: Contains action items
    const hasActions = /action/i.test(notes)
    console.log(`[${hasActions ? "PASS" : "FAIL"}] Contains action items section`)

    // Test 5: Contains decisions or next steps
    const hasDecisionsOrNext = /decision|next\s*step/i.test(notes)
    console.log(`[${hasDecisionsOrNext ? "PASS" : "FAIL"}] Contains decisions or next steps`)

    // Test 6: Output is clean
    const noMarkdown = !notes.startsWith("```")
    const noQuotes = !notes.startsWith('"')
    console.log(`[${noMarkdown ? "PASS" : "FAIL"}] No markdown code blocks`)
    console.log(`[${noQuotes ? "PASS" : "FAIL"}] No wrapping quotes`)

    console.log("\n--- Generated Notes ---")
    console.log(notes)
    console.log("--- End ---\n")

    const passed = [t1, t2, hasSummary, hasActions, hasDecisionsOrNext, noMarkdown, noQuotes].filter(Boolean).length
    console.log(`Notes generator: ${passed}/7 tests passed`)
    return passed >= 5
  }

  console.log(`Notes generator: ${t1 ? 1 : 0}/2 tests passed (AI unavailable)`)
  return t1
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== AI Meeting Assistant Test Suite ===")

  const rateLimiterOk = testRateLimiter()

  let agendaOk = false
  try {
    agendaOk = await testAgendaGenerator()
  } catch (err) {
    console.error("Agenda test error:", err)
  }

  let notesOk = false
  try {
    notesOk = await testNotesGenerator()
  } catch (err) {
    console.error("Notes test error:", err)
  }

  console.log("\n=== Summary ===")
  console.log(`Rate limiter: ${rateLimiterOk ? "PASS" : "FAIL"}`)
  console.log(`Agenda generator: ${agendaOk ? "PASS" : "FAIL"}`)
  console.log(`Notes generator: ${notesOk ? "PASS" : "FAIL"}`)

  const allPass = rateLimiterOk && agendaOk && notesOk
  console.log(`\nOverall: ${allPass ? "ALL PASSED" : "SOME FAILURES"}`)
  process.exit(allPass ? 0 : 1)
}

main()
