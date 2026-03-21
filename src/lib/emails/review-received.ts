import { emailLayout, ctaButton, AMBER } from "./layout"

type ReviewReceivedData = {
  workerName: string
  overallRating: number
  comment?: string | null
}

function starHtml(rating: number): string {
  return Array.from({ length: 5 })
    .map((_, i) =>
      `<span style="font-size:20px; color:${i < rating ? AMBER : "#d4d4d4"};">★</span>`
    )
    .join("")
}

export function reviewReceivedEmail(data: ReviewReceivedData): {
  subject: string
  html: string
} {
  const commentSection = data.comment
    ? `<div style="margin:16px 0 0; padding:12px 16px; background-color:#fafafa; border-radius:8px; border:1px solid #e5e5e5;">
        <p style="margin:0; font-size:13px; color:#737373;">Comment:</p>
        <p style="margin:4px 0 0; font-size:14px; color:#1a1a1a; line-height:1.5;">"${data.comment}"</p>
      </div>`
    : ""

  const content = `
    <h1 style="margin:0 0 8px; font-size:22px; font-weight:700; color:#1a1a1a;">New review received!</h1>
    <p style="margin:0 0 16px; font-size:15px; color:#525252; line-height:1.5;">
      <strong>${data.workerName}</strong> left a review for your cafe.
    </p>

    <div style="text-align:center; margin:16px 0;">
      ${starHtml(data.overallRating)}
      <p style="margin:8px 0 0; font-size:14px; color:#525252;">${data.overallRating} out of 5 stars</p>
    </div>

    ${commentSection}

    ${ctaButton("View Reviews", `${process.env.NEXT_PUBLIC_APP_URL || "https://perch.so"}/cafe-dashboard/reviews`)}
  `

  return {
    subject: `New ${data.overallRating}★ review from ${data.workerName}`,
    html: emailLayout(
      content,
      "You're receiving this because someone reviewed your cafe on Perch."
    ),
  }
}
