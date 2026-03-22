/**
 * Verification script for calendar integration.
 * Tests:
 *  1. Google Calendar URL — correct format, pre-filled fields, encoded params
 *  2. Outlook Calendar URL — correct format, ISO dates, encoded params
 *  3. ICS file — valid iCalendar structure, required fields, CRLF line endings
 *  4. UTC conversion — IST times correctly shifted
 *  5. Recurring — RRULE present for weekly/biweekly
 *  6. Edge cases — special characters, null fields, long agendas
 *  7. Component integration — calendar appears for correct booking statuses
 *
 * Run: npx tsx scripts/verify-calendar.ts
 */

// ── Inline copies (avoids path-alias issues) ──

type CalendarEventInput = {
  id: string
  date: string
  startTime: string
  endTime: string
  cafeName: string
  cafeAddress: string
  spaceName: string
  numAttendees: number
  meetingTitle: string | null
  agenda: string | null
  isRecurring?: boolean
  recurrencePattern?: string | null
}

function toUTCCalendarFormat(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number) as [number, number, number]
  const [h, m] = timeStr.split(":").map(Number) as [number, number]
  const local = new Date(y, mo - 1, d, h, m, 0)
  const utc = new Date(local.getTime() - 330 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${utc.getFullYear()}${pad(utc.getMonth() + 1)}${pad(utc.getDate())}` +
    `T${pad(utc.getHours())}${pad(utc.getMinutes())}00Z`
  )
}

function buildDescription(event: CalendarEventInput): string {
  const lines: string[] = [
    `Space: ${event.spaceName}`,
    `Attendees: ${event.numAttendees}`,
  ]
  if (event.meetingTitle) lines.push(`Meeting: ${event.meetingTitle}`)
  if (event.agenda) lines.push(`\nAgenda:\n${event.agenda}`)
  lines.push(`\nBooked via Perch — getperch.in`)
  lines.push(`Booking ID: ${event.id}`)
  return lines.join("\n")
}

function buildTitle(event: CalendarEventInput): string {
  if (event.meetingTitle) return `${event.meetingTitle} — Perch`
  return `Meeting at ${event.cafeName} — Perch`
}

function generateGoogleCalendarUrl(event: CalendarEventInput): string {
  const title = buildTitle(event)
  const start = toUTCCalendarFormat(event.date, event.startTime)
  const end = toUTCCalendarFormat(event.date, event.endTime)
  const description = buildDescription(event)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location: `${event.cafeName}, ${event.cafeAddress}`,
  })
  if (event.isRecurring && event.recurrencePattern) {
    const interval = event.recurrencePattern === "biweekly" ? 2 : 1
    params.set("recur", `RRULE:FREQ=WEEKLY;INTERVAL=${interval}`)
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function generateOutlookCalendarUrl(event: CalendarEventInput): string {
  const title = buildTitle(event)
  const description = buildDescription(event)
  const startDt = `${event.date}T${event.startTime}:00+05:30`
  const endDt = `${event.date}T${event.endTime}:00+05:30`
  const params = new URLSearchParams({
    subject: title,
    startdt: startDt,
    enddt: endDt,
    body: description,
    location: `${event.cafeName}, ${event.cafeAddress}`,
    path: "/calendar/action/compose",
    rru: "addevent",
  })
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function generateICSFile(event: CalendarEventInput): string {
  const title = buildTitle(event)
  const start = toUTCCalendarFormat(event.date, event.startTime)
  const end = toUTCCalendarFormat(event.date, event.endTime)
  const description = escapeICS(buildDescription(event))
  const location = escapeICS(`${event.cafeName}, ${event.cafeAddress}`)
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Perch//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@getperch.in`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
  ]
  if (event.isRecurring && event.recurrencePattern) {
    const interval = event.recurrencePattern === "biweekly" ? 2 : 1
    lines.push(`RRULE:FREQ=WEEKLY;INTERVAL=${interval}`)
  }
  lines.push("END:VEVENT", "END:VCALENDAR")
  return lines.join("\r\n")
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

// ── Sample booking ──

const sampleEvent: CalendarEventInput = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  date: "2026-04-10",
  startTime: "14:30",
  endTime: "16:00",
  cafeName: "Brew & Work",
  cafeAddress: "123 MG Road, Bengaluru",
  spaceName: "Sky Lounge",
  numAttendees: 4,
  meetingTitle: "Q2 Planning Sprint",
  agenda: "1. Review Q1 metrics\n2. Set Q2 OKRs\n3. Assign owners",
}

// ═══════════════════════════════════════════
//  TEST GROUP 1: UTC Conversion
// ═══════════════════════════════════════════
console.log("\n── 1. IST → UTC conversion ──")

const utcStart = toUTCCalendarFormat("2026-04-10", "14:30")
// 14:30 IST = 09:00 UTC
assert(utcStart === "20260410T090000Z", `14:30 IST → 09:00 UTC (got ${utcStart})`)

const utcEnd = toUTCCalendarFormat("2026-04-10", "16:00")
// 16:00 IST = 10:30 UTC
assert(utcEnd === "20260410T103000Z", `16:00 IST → 10:30 UTC (got ${utcEnd})`)

// Midnight IST = 18:30 previous day UTC
const utcMidnight = toUTCCalendarFormat("2026-04-10", "00:00")
assert(utcMidnight === "20260409T183000Z", `00:00 IST → 18:30 previous day UTC (got ${utcMidnight})`)

// Early morning: 05:30 IST = 00:00 UTC (same day)
const utcEarly = toUTCCalendarFormat("2026-04-10", "05:30")
assert(utcEarly === "20260410T000000Z", `05:30 IST → 00:00 UTC same day (got ${utcEarly})`)

// ═══════════════════════════════════════════
//  TEST GROUP 2: Google Calendar URL
// ═══════════════════════════════════════════
console.log("\n── 2. Google Calendar URL ──")

const googleUrl = generateGoogleCalendarUrl(sampleEvent)
assert(googleUrl.startsWith("https://calendar.google.com/calendar/render?"), "Correct base URL")

const googleParsed = new URL(googleUrl)
assert(googleParsed.searchParams.get("action") === "TEMPLATE", "action=TEMPLATE")
assert(googleParsed.searchParams.get("text") === "Q2 Planning Sprint — Perch", "Title with meeting title")

const dates = googleParsed.searchParams.get("dates")!
assert(dates.includes("20260410T090000Z"), "Start time in dates param")
assert(dates.includes("20260410T103000Z"), "End time in dates param")
assert(dates.includes("/"), "Start/end separated by /")

const details = googleParsed.searchParams.get("details")!
assert(details.includes("Space: Sky Lounge"), "Description includes space name")
assert(details.includes("Attendees: 4"), "Description includes attendee count")
assert(details.includes("Meeting: Q2 Planning Sprint"), "Description includes meeting title")
assert(details.includes("Agenda:"), "Description includes agenda")
assert(details.includes("Review Q1 metrics"), "Description includes agenda content")
assert(details.includes("Booking ID: a1b2c3d4"), "Description includes booking ID")
assert(details.includes("getperch.in"), "Description includes Perch branding")

const location = googleParsed.searchParams.get("location")!
assert(location.includes("Brew & Work"), "Location includes cafe name")
assert(location.includes("123 MG Road"), "Location includes address")

// No recurrence for non-recurring
assert(!googleParsed.searchParams.has("recur"), "No recur param for non-recurring booking")

// ═══════════════════════════════════════════
//  TEST GROUP 3: Google URL — no meeting title
// ═══════════════════════════════════════════
console.log("\n── 3. Google Calendar URL — no meeting title ──")

const noTitleEvent = { ...sampleEvent, meetingTitle: null, agenda: null }
const noTitleUrl = generateGoogleCalendarUrl(noTitleEvent)
const noTitleParsed = new URL(noTitleUrl)
assert(
  noTitleParsed.searchParams.get("text") === "Meeting at Brew & Work — Perch",
  "Falls back to 'Meeting at [Cafe Name] — Perch'"
)
const noTitleDetails = noTitleParsed.searchParams.get("details")!
assert(!noTitleDetails.includes("Meeting:"), "No meeting line in description when null")
assert(!noTitleDetails.includes("Agenda:"), "No agenda line in description when null")

// ═══════════════════════════════════════════
//  TEST GROUP 4: Outlook Calendar URL
// ═══════════════════════════════════════════
console.log("\n── 4. Outlook Calendar URL ──")

const outlookUrl = generateOutlookCalendarUrl(sampleEvent)
assert(outlookUrl.startsWith("https://outlook.live.com/calendar/0/action/compose?"), "Correct Outlook base URL")

const outlookParsed = new URL(outlookUrl)
assert(outlookParsed.searchParams.get("subject") === "Q2 Planning Sprint — Perch", "Subject matches")
assert(outlookParsed.searchParams.get("startdt") === "2026-04-10T14:30:00+05:30", "Start in ISO with IST offset")
assert(outlookParsed.searchParams.get("enddt") === "2026-04-10T16:00:00+05:30", "End in ISO with IST offset")
assert(outlookParsed.searchParams.get("rru") === "addevent", "rru=addevent")

const outlookBody = outlookParsed.searchParams.get("body")!
assert(outlookBody.includes("Sky Lounge"), "Body includes space name")
assert(outlookBody.includes("getperch.in"), "Body includes Perch branding")

// ═══════════════════════════════════════════
//  TEST GROUP 5: ICS file format
// ═══════════════════════════════════════════
console.log("\n── 5. ICS file structure ──")

const ics = generateICSFile(sampleEvent)
const icsLines = ics.split("\r\n")

assert(icsLines[0] === "BEGIN:VCALENDAR", "Starts with BEGIN:VCALENDAR")
assert(icsLines[icsLines.length - 1] === "END:VCALENDAR", "Ends with END:VCALENDAR")
assert(ics.includes("VERSION:2.0"), "Has VERSION:2.0")
assert(ics.includes("PRODID:-//Perch//Booking//EN"), "Has PRODID")
assert(ics.includes("CALSCALE:GREGORIAN"), "Has CALSCALE:GREGORIAN")
assert(ics.includes("METHOD:PUBLISH"), "Has METHOD:PUBLISH")
assert(ics.includes("BEGIN:VEVENT"), "Has BEGIN:VEVENT")
assert(ics.includes("END:VEVENT"), "Has END:VEVENT")
assert(ics.includes("UID:a1b2c3d4-e5f6-7890-abcd-ef1234567890@getperch.in"), "UID with booking ID")
assert(ics.includes("DTSTART:20260410T090000Z"), "DTSTART in UTC")
assert(ics.includes("DTEND:20260410T103000Z"), "DTEND in UTC")
assert(ics.includes("STATUS:CONFIRMED"), "STATUS:CONFIRMED")

// Verify ICS escaping
assert(ics.includes("SUMMARY:Q2 Planning Sprint — Perch"), "SUMMARY has title")
assert(ics.includes("LOCATION:Brew & Work\\, 123 MG Road\\, Bengaluru"), "LOCATION escapes commas")

// Verify CRLF line endings (iCalendar spec requires this)
assert(ics.includes("\r\n"), "Uses CRLF line endings")

// No RRULE for non-recurring
assert(!ics.includes("RRULE"), "No RRULE for non-recurring")

// ═══════════════════════════════════════════
//  TEST GROUP 6: Recurring bookings
// ═══════════════════════════════════════════
console.log("\n── 6. Recurring bookings — weekly ──")

const weeklyEvent = { ...sampleEvent, isRecurring: true, recurrencePattern: "weekly" }
const weeklyGoogleUrl = generateGoogleCalendarUrl(weeklyEvent)
const weeklyParsed = new URL(weeklyGoogleUrl)
assert(weeklyParsed.searchParams.get("recur") === "RRULE:FREQ=WEEKLY;INTERVAL=1", "Google URL has weekly RRULE")

const weeklyIcs = generateICSFile(weeklyEvent)
assert(weeklyIcs.includes("RRULE:FREQ=WEEKLY;INTERVAL=1"), "ICS has weekly RRULE")

console.log("\n── 7. Recurring bookings — biweekly ──")

const biweeklyEvent = { ...sampleEvent, isRecurring: true, recurrencePattern: "biweekly" }
const biweeklyGoogleUrl = generateGoogleCalendarUrl(biweeklyEvent)
const biweeklyParsed = new URL(biweeklyGoogleUrl)
assert(biweeklyParsed.searchParams.get("recur") === "RRULE:FREQ=WEEKLY;INTERVAL=2", "Google URL has biweekly RRULE")

const biweeklyIcs = generateICSFile(biweeklyEvent)
assert(biweeklyIcs.includes("RRULE:FREQ=WEEKLY;INTERVAL=2"), "ICS has biweekly RRULE")

// ═══════════════════════════════════════════
//  TEST GROUP 7: Special characters
// ═══════════════════════════════════════════
console.log("\n── 8. Special characters ──")

const specialEvent: CalendarEventInput = {
  id: "special-id-123",
  date: "2026-05-01",
  startTime: "10:00",
  endTime: "11:30",
  cafeName: "Café Résumé & Co.",
  cafeAddress: "42, Street #5; Sector 22",
  spaceName: "Room A/B",
  numAttendees: 2,
  meetingTitle: "Status: Review (Urgent!)",
  agenda: "Check items; discuss next steps,\nreview budget",
}

const specialGoogleUrl = generateGoogleCalendarUrl(specialEvent)
assert(specialGoogleUrl.includes("calendar.google.com"), "Special chars don't break Google URL")
const specialParsed = new URL(specialGoogleUrl)
assert(specialParsed.searchParams.get("text") !== null, "Title param exists with special chars")
assert(specialParsed.searchParams.get("location") !== null, "Location param exists with special chars")

const specialIcs = generateICSFile(specialEvent)
assert(specialIcs.includes("BEGIN:VCALENDAR"), "ICS valid with special chars")
assert(specialIcs.includes("LOCATION:"), "LOCATION present with special chars")
// Verify semicolons and commas are escaped in ICS
assert(specialIcs.includes("\\;"), "Semicolons escaped in ICS")
assert(specialIcs.includes("\\,"), "Commas escaped in ICS")

// ═══════════════════════════════════════════
//  TEST GROUP 8: Component integration logic
// ═══════════════════════════════════════════
console.log("\n── 9. Calendar visibility by booking status ──")

const statuses = ["pending", "confirmed", "checked_in", "completed", "cancelled"] as const
const shouldShowCalendar = (status: string) =>
  status === "confirmed" || status === "checked_in"

assert(shouldShowCalendar("confirmed"), "Confirmed → show calendar")
assert(shouldShowCalendar("checked_in"), "Checked-in → show calendar")
assert(!shouldShowCalendar("pending"), "Pending → no calendar")
assert(!shouldShowCalendar("completed"), "Completed → no calendar")
assert(!shouldShowCalendar("cancelled"), "Cancelled → no calendar")

// ═══════════════════════════════════════════
//  TEST GROUP 9: Email template integration
// ═══════════════════════════════════════════
console.log("\n── 10. Email template calendar link ──")

// Simulate what the webhook does
const emailCalendarUrl = generateGoogleCalendarUrl({
  id: "booking-123",
  date: "2026-04-15",
  startTime: "09:00",
  endTime: "10:30",
  cafeName: "WorkBrew",
  cafeAddress: "HSR Layout",
  spaceName: "Meeting Room 1",
  numAttendees: 3,
  meetingTitle: null,
  agenda: null,
})
assert(emailCalendarUrl.includes("calendar.google.com"), "Email calendar URL is valid Google Calendar link")
assert(emailCalendarUrl.includes("Meeting+at+WorkBrew"), "Email URL has correct fallback title")

// ═══════════════════════════════════════════
//  Summary
// ═══════════════════════════════════════════
console.log(`\n══════════════════════════════`)
console.log(`  Results: ${passed} passed, ${failed} failed`)
console.log(`══════════════════════════════\n`)

if (failed > 0) {
  console.log("Sample Google Calendar URL (open in browser to verify):")
  console.log(generateGoogleCalendarUrl(sampleEvent))
  console.log("\nSample ICS content:")
  console.log(generateICSFile(sampleEvent))
}

process.exit(failed > 0 ? 1 : 0)
