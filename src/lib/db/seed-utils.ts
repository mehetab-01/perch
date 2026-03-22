// ─── Seed Utility Helpers ────────────────────────────────────────────────────

/** Random integer between min and max (inclusive) */
const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

/** Random float between min and max with fixed decimals */
const randomFloat = (min: number, max: number, decimals = 1): number =>
  Number((Math.random() * (max - min) + min).toFixed(decimals))

/** Pick a random element from an array */
const randomFrom = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

/** Pick a random subset of min..max items */
const randomSubset = <T>(arr: readonly T[], min: number, max: number): T[] => {
  const count = randomBetween(min, Math.min(max, arr.length))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/** Date N days ago */
const daysAgo = (n: number): Date => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

/** Date N days from now */
const daysFromNow = (n: number): Date => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

/** Format a Date as YYYY-MM-DD string */
const formatDate = (d: Date): string => d.toISOString().split("T")[0]

/** Convert a cafe name to a URL-safe slug */
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

/**
 * Calculate booking amounts matching the app's formula:
 * - platformFee = 5% of base
 * - gst = 18% of (base + platformFee)
 * - totalAmount = base + platformFee + gst
 * - cafePayout = base - 12% commission
 */
const PLATFORM_FEE_RATE = 0.05
const GST_RATE = 0.18
const COMMISSION_RATE = 0.12

const calculateBookingAmounts = (pricePerHourPaise: number, hours: number) => {
  const base = Math.round(pricePerHourPaise * hours)
  const platformFee = Math.round(base * PLATFORM_FEE_RATE)
  const gstAmount = Math.round((base + platformFee) * GST_RATE)
  const totalAmount = base + platformFee + gstAmount
  const cafePayout = base - Math.round(base * COMMISSION_RATE)
  return { totalAmount, platformFee, cafePayout, gstAmount }
}

export {
  randomBetween,
  randomFloat,
  randomFrom,
  randomSubset,
  daysAgo,
  daysFromNow,
  formatDate,
  generateSlug,
  calculateBookingAmounts,
}
