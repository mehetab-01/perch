import { emailLayout, ctaButton, detailRow } from "./layout"

type MeetingReminderData = {
  cafeName: string
  spaceName: string
  date: string
  startTime: string
  endTime: string
  address: string
  bookingId: string
  /** "1_hour" or "24_hours" */
  reminderType: "1_hour" | "24_hours"
}

export function meetingReminderEmail(data: MeetingReminderData): {
  subject: string
  html: string
} {
  const timeLabel = data.reminderType === "1_hour" ? "in 1 hour" : "tomorrow"

  const content = `
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#1a1a1a;">Meeting ${timeLabel}!</h1>
    <p style="margin:0 0 24px; font-size:15px; color:#525252; line-height:1.5;">
      Your meeting at <strong>${data.cafeName}</strong> is coming up ${timeLabel}. Don't forget to bring your QR code for check-in.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fafafa; border-radius:8px; padding:16px; border:1px solid #e5e5e5;">
      ${detailRow("Space", data.spaceName)}
      ${detailRow("Date", data.date)}
      ${detailRow("Time", `${data.startTime} – ${data.endTime}`)}
      ${detailRow("Location", data.address)}
    </table>

    ${ctaButton("View QR Code", `${process.env.NEXT_PUBLIC_APP_URL || "https://perch.so"}/bookings/${data.bookingId}`)}

    <p style="margin:0; font-size:13px; color:#737373; line-height:1.5;">
      Show the QR code on your booking page to check in at the cafe.
    </p>
  `

  return {
    subject: `Reminder: Meeting at ${data.cafeName} ${timeLabel}`,
    html: emailLayout(
      content,
      "You're receiving this because you have an upcoming meeting booked on Perch."
    ),
  }
}
