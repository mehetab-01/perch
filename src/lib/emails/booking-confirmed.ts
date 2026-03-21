import { emailLayout, ctaButton, detailRow } from "./layout"

type BookingConfirmedData = {
  cafeName: string
  spaceName: string
  date: string
  startTime: string
  endTime: string
  address: string
  bookingId: string
}

export function bookingConfirmedEmail(data: BookingConfirmedData): {
  subject: string
  html: string
} {
  const content = `
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#1a1a1a;">Your meeting is confirmed!</h1>
    <p style="margin:0 0 24px; font-size:15px; color:#525252; line-height:1.5;">
      Your booking at <strong>${data.cafeName}</strong> has been confirmed. Here are the details:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fafafa; border-radius:8px; padding:16px; border:1px solid #e5e5e5;">
      ${detailRow("Space", data.spaceName)}
      ${detailRow("Date", data.date)}
      ${detailRow("Time", `${data.startTime} – ${data.endTime}`)}
      ${detailRow("Location", data.address)}
    </table>

    ${ctaButton("View Booking Details", `${process.env.NEXT_PUBLIC_APP_URL || "https://perch.so"}/bookings/${data.bookingId}`)}

    <p style="margin:0; font-size:13px; color:#737373; line-height:1.5;">
      Show your QR code at the cafe to check in. You can find it on your booking details page.
    </p>
  `

  return {
    subject: `Booking confirmed at ${data.cafeName}`,
    html: emailLayout(
      content,
      "You're receiving this because you made a booking on Perch."
    ),
  }
}
