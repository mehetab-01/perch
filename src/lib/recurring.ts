type RecurrencePattern = "weekly" | "biweekly"

const MAX_WEEKLY_INSTANCES = 12 // 3 months
const MAX_BIWEEKLY_INSTANCES = 6 // ~3 months

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Generates all recurring dates from startDate to endDate following the pattern.
 * Skips dates that fall on blocked dates.
 * Returns array of YYYY-MM-DD strings (including the startDate itself).
 */
function generateRecurringDates(
  startDate: string,
  pattern: RecurrencePattern,
  endDate: string,
  blockedDates: Set<string> = new Set()
): string[] {
  const maxInstances =
    pattern === "weekly" ? MAX_WEEKLY_INSTANCES : MAX_BIWEEKLY_INSTANCES
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

/**
 * Returns the day name for a given date string (e.g., "Tuesday").
 */
function getDayName(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
  })
}

/**
 * Calculates the max end date (3 months from a given start date).
 */
function getMaxRecurrenceEndDate(startDate: string): string {
  const start = new Date(startDate + "T00:00:00")
  start.setMonth(start.getMonth() + 3)
  return toLocalDateStr(start)
}

export { generateRecurringDates, getDayName, getMaxRecurrenceEndDate }
export type { RecurrencePattern }
