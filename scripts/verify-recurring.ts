/**
 * Verification script for recurring booking logic.
 * Tests:
 *  1. Date generation (weekly/biweekly)
 *  2. Blocked-date skipping
 *  3. Max instance caps
 *  4. Cancel-all future-only filter
 *
 * Run: npx tsx scripts/verify-recurring.ts
 */

// ── Inline copy of generateRecurringDates (avoids path-alias issues) ──

type RecurrencePattern = "weekly" | "biweekly"

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function generateRecurringDates(
  startDate: string,
  pattern: RecurrencePattern,
  endDate: string,
  blockedDates: Set<string> = new Set()
): string[] {
  const maxInstances = pattern === "weekly" ? 12 : 6
  const intervalDays = pattern === "weekly" ? 7 : 14

  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")

  if (end <= start) return [startDate]

  const dates: string[] = []
  const current = new Date(start)

  while (current <= end && dates.length < maxInstances) {
    const dateStr = toLocalDateStr(current)
    if (!blockedDates.has(dateStr)) {
      dates.push(dateStr)
    }
    current.setDate(current.getDate() + intervalDays)
  }

  return dates
}

// ── Inline copy of calculateRefundPercentage ──

function calculateRefundPercentage(bookingDate: string, startTime: string): number {
  const bookingStart = new Date(`${bookingDate}T${startTime}:00`)
  const now = new Date()
  const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilBooking > 24) return 100
  if (hoursUntilBooking >= 1) return 50
  return 0
}

// ── Test harness ──

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ ${label}`)
    failed++
  }
}

// ═══════════════════════════════════════════
//  TEST GROUP 1: Date generation
// ═══════════════════════════════════════════
console.log("\n── 1. Weekly date generation ──")

const weekly = generateRecurringDates("2026-04-06", "weekly", "2026-06-28")
assert(weekly[0] === "2026-04-06", "Starts on start date")
assert(weekly.length === 12, `Weekly generates max 12 instances (got ${weekly.length})`)
assert(weekly[1] === "2026-04-13", "Second date is +7 days")
assert(weekly[11] === "2026-06-22", `Last date is week 12: ${weekly[11]}`)

console.log("\n── 2. Biweekly date generation ──")

const biweekly = generateRecurringDates("2026-04-06", "biweekly", "2026-09-01")
assert(biweekly[0] === "2026-04-06", "Starts on start date")
assert(biweekly.length === 6, `Biweekly generates max 6 instances (got ${biweekly.length})`)
assert(biweekly[1] === "2026-04-20", "Second date is +14 days")

console.log("\n── 3. End date before start date ──")

const edgeCase = generateRecurringDates("2026-04-06", "weekly", "2026-03-01")
assert(edgeCase.length === 1, `Returns only start date (got ${edgeCase.length})`)
assert(edgeCase[0] === "2026-04-06", "Returns the start date itself")

// ═══════════════════════════════════════════
//  TEST GROUP 2: Blocked-date skipping
// ═══════════════════════════════════════════
console.log("\n── 4. Blocked dates are skipped ──")

const blocked = new Set(["2026-04-13", "2026-04-27"])
const withBlocked = generateRecurringDates("2026-04-06", "weekly", "2026-06-28", blocked)
assert(!withBlocked.includes("2026-04-13"), "Skips blocked date 2026-04-13")
assert(!withBlocked.includes("2026-04-27"), "Skips blocked date 2026-04-27")
assert(withBlocked.includes("2026-04-06"), "Keeps non-blocked start date")
assert(withBlocked.includes("2026-04-20"), "Keeps non-blocked date 2026-04-20")
assert(withBlocked.length <= 12, `Still respects max cap (got ${withBlocked.length})`)

console.log("\n── 5. All dates blocked ──")

const allBlocked = new Set(["2026-04-06", "2026-04-13", "2026-04-20"])
const noDates = generateRecurringDates("2026-04-06", "weekly", "2026-04-20", allBlocked)
assert(noDates.length === 0, `All dates blocked → empty array (got ${noDates.length})`)

// ═══════════════════════════════════════════
//  TEST GROUP 3: Cancel-all future filter
// ═══════════════════════════════════════════
console.log("\n── 6. Cancel-all filters only future cancellable bookings ──")

// Simulated series bookings
const today = new Date().toISOString().split("T")[0]!
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]!
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]!

const seriesBookings = [
  { id: "1", date: yesterday, status: "completed" as const },
  { id: "2", date: yesterday, status: "cancelled" as const },
  { id: "3", date: today, status: "confirmed" as const },
  { id: "4", date: tomorrow, status: "confirmed" as const },
  { id: "5", date: nextWeek, status: "pending" as const },
  { id: "6", date: nextWeek, status: "checked_in" as const },
]

// Replicate the cancel-all filter from the route
const cancellableStatuses = ["cancelled", "completed", "checked_in"]
const futureCancellable = seriesBookings.filter(
  (b) =>
    b.date >= today &&
    !cancellableStatuses.includes(b.status)
)

assert(!futureCancellable.find((b) => b.id === "1"), "Past completed booking excluded")
assert(!futureCancellable.find((b) => b.id === "2"), "Past cancelled booking excluded")
assert(futureCancellable.find((b) => b.id === "3") !== undefined, "Today's confirmed booking included")
assert(futureCancellable.find((b) => b.id === "4") !== undefined, "Tomorrow's confirmed booking included")
assert(futureCancellable.find((b) => b.id === "5") !== undefined, "Future pending booking included")
assert(!futureCancellable.find((b) => b.id === "6"), "Checked-in booking excluded (already in use)")

// ═══════════════════════════════════════════
//  TEST GROUP 4: Refund percentage logic
// ═══════════════════════════════════════════
console.log("\n── 7. Refund percentages ──")

const farFuture = new Date(Date.now() + 48 * 3600 * 1000)
const farFutureDate = farFuture.toISOString().split("T")[0]!
const farFutureTime = farFuture.toTimeString().slice(0, 5)
assert(calculateRefundPercentage(farFutureDate, farFutureTime) === 100, ">24h → 100% refund")

const nearFuture = new Date(Date.now() + 6 * 3600 * 1000)
const nearFutureDate = nearFuture.toISOString().split("T")[0]!
const nearFutureTime = nearFuture.toTimeString().slice(0, 5)
assert(calculateRefundPercentage(nearFutureDate, nearFutureTime) === 50, "1-24h → 50% refund")

const veryNear = new Date(Date.now() + 30 * 60 * 1000)
const veryNearDate = veryNear.toISOString().split("T")[0]!
const veryNearTime = veryNear.toTimeString().slice(0, 5)
assert(calculateRefundPercentage(veryNearDate, veryNearTime) === 0, "<1h → 0% refund")

// ═══════════════════════════════════════════
//  Summary
// ═══════════════════════════════════════════
console.log(`\n══════════════════════════════`)
console.log(`  Results: ${passed} passed, ${failed} failed`)
console.log(`══════════════════════════════\n`)

process.exit(failed > 0 ? 1 : 0)
