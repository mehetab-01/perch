type CalendarEventInput = {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  cafeName: string
  cafeAddress: string
  spaceName: string
  numAttendees: number
  meetingTitle: string | null
  agenda: string | null
  isRecurring?: boolean
  recurrencePattern?: string | null // "weekly" | "biweekly"
}

/**
 * Convert "2026-04-06" + "14:30" → "20260406T090000Z" (IST → UTC).
 * IST is UTC+5:30 so we subtract 5h30m.
 */
function toUTCCalendarFormat(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number) as [number, number, number]
  const [h, m] = timeStr.split(":").map(Number) as [number, number]

  const local = new Date(y, mo - 1, d, h, m, 0)
  // Subtract IST offset (5h30m = 330 minutes)
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

// ── Google Calendar URL ──

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

  // Add RRULE for recurring bookings
  if (event.isRecurring && event.recurrencePattern) {
    const freq = event.recurrencePattern === "biweekly" ? "WEEKLY" : "WEEKLY"
    const interval = event.recurrencePattern === "biweekly" ? 2 : 1
    params.set("recur", `RRULE:FREQ=${freq};INTERVAL=${interval}`)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// ── Outlook Calendar URL ──

function generateOutlookCalendarUrl(event: CalendarEventInput): string {
  const title = buildTitle(event)
  const description = buildDescription(event)

  // Outlook uses ISO 8601 format
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

// ── ICS file content ──

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

  // Add RRULE for recurring bookings
  if (event.isRecurring && event.recurrencePattern) {
    const interval = event.recurrencePattern === "biweekly" ? 2 : 1
    lines.push(`RRULE:FREQ=WEEKLY;INTERVAL=${interval}`)
  }

  lines.push("END:VEVENT", "END:VCALENDAR")

  return lines.join("\r\n")
}

export {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateICSFile,
}
export type { CalendarEventInput }
