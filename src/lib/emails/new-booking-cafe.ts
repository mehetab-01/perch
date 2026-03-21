import { emailLayout, ctaButton, detailRow } from "./layout"

type NewBookingCafeData = {
  workerName: string
  spaceName: string
  date: string
  startTime: string
  endTime: string
  attendees: number
}

export function newBookingCafeEmail(data: NewBookingCafeData): {
  subject: string
  html: string
} {
  const content = `
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#1a1a1a;">New booking received!</h1>
    <p style="margin:0 0 24px; font-size:15px; color:#525252; line-height:1.5;">
      <strong>${data.workerName}</strong> has booked a space at your cafe.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fafafa; border-radius:8px; padding:16px; border:1px solid #e5e5e5;">
      ${detailRow("Space", data.spaceName)}
      ${detailRow("Date", data.date)}
      ${detailRow("Time", `${data.startTime} – ${data.endTime}`)}
      ${detailRow("Attendees", `${data.attendees} ${data.attendees === 1 ? "person" : "people"}`)}
    </table>

    ${ctaButton("View in Dashboard", `${process.env.NEXT_PUBLIC_APP_URL || "https://perch.so"}/cafe-dashboard/bookings`)}
  `

  return {
    subject: `New booking: ${data.workerName} on ${data.date}`,
    html: emailLayout(
      content,
      "You're receiving this because you're a cafe owner on Perch."
    ),
  }
}
