import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "Perch <noreply@perch.so>"

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to)
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("[email] Failed to send:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("[email] Error sending email:", err)
    return null
  }
}
