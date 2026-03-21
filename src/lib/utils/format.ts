/**
 * Format a 24h time string ("14:30") to 12h format ("2:30 PM")
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(":")
  const hour = parseInt(h!, 10)
  const suffix = hour >= 12 ? "PM" : "AM"
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${suffix}`
}

/**
 * Format an ISO date string ("2026-03-21") to a relative or short label.
 * Returns "Today", "Tomorrow", or "Wed, Mar 21".
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (dateStr === today.toISOString().split("T")[0]) return "Today"
  if (dateStr === tomorrow.toISOString().split("T")[0]) return "Tomorrow"

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format an ISO date string to a full label.
 * Returns "Saturday, March 21, 2026".
 */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format an ISO date string to a medium label.
 * Returns "Sat, Mar 21, 2026".
 */
export function formatDateMedium(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format paise (integer) to a rupee string with Indian locale.
 * E.g. 150000 → "₹1,500"
 */
export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}
