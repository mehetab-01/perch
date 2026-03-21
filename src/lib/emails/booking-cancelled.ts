import { emailLayout, ctaButton, detailRow } from "./layout"

type BookingCancelledData = {
  cafeName: string
  spaceName: string
  date: string
  startTime: string
  endTime: string
  reason?: string | null
  refundPercentage?: number
  refundAmount?: number
  /** "worker" = email goes to worker; "cafe" = email goes to cafe owner */
  recipientRole: "worker" | "cafe"
}

export function bookingCancelledEmail(data: BookingCancelledData): {
  subject: string
  html: string
} {
  const refundInfo =
    data.recipientRole === "worker" && data.refundPercentage && data.refundPercentage > 0
      ? `<p style="margin:16px 0 0; font-size:14px; color:#525252; line-height:1.5;">
          A <strong>${data.refundPercentage}%</strong> refund of <strong>₹${((data.refundAmount ?? 0) / 100).toLocaleString("en-IN")}</strong> has been initiated to your original payment method. It may take 5–7 business days to reflect.
        </p>`
      : ""

  const reasonLine = data.reason
    ? detailRow("Reason", data.reason)
    : ""

  const dashboardUrl =
    data.recipientRole === "worker"
      ? "/bookings"
      : "/cafe-dashboard/bookings"

  const content = `
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#1a1a1a;">Booking cancelled</h1>
    <p style="margin:0 0 24px; font-size:15px; color:#525252; line-height:1.5;">
      A booking at <strong>${data.cafeName}</strong> has been cancelled.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fafafa; border-radius:8px; padding:16px; border:1px solid #e5e5e5;">
      ${detailRow("Space", data.spaceName)}
      ${detailRow("Date", data.date)}
      ${detailRow("Time", `${data.startTime} – ${data.endTime}`)}
      ${reasonLine}
    </table>

    ${refundInfo}

    ${ctaButton("View Bookings", `${process.env.NEXT_PUBLIC_APP_URL || "https://perch.so"}${dashboardUrl}`)}
  `

  return {
    subject: `Booking cancelled — ${data.cafeName} on ${data.date}`,
    html: emailLayout(
      content,
      "You're receiving this because a booking you're involved with on Perch was cancelled."
    ),
  }
}
