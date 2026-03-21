const AMBER = "#f59e0b"
const DARK_BG = "#1a1a1a"
const CARD_BG = "#ffffff"
const MUTED = "#737373"
const BORDER = "#e5e5e5"

export function emailLayout(content: string, footerNote: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Perch</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:${CARD_BG}; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${DARK_BG}; padding:24px 32px;">
              <span style="font-size:24px; font-weight:700; color:${AMBER}; letter-spacing:-0.5px;">perch</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid ${BORDER}; padding:24px 32px;">
              <p style="margin:0 0 8px; font-size:12px; color:${MUTED}; line-height:1.5;">
                ${footerNote}
              </p>
              <p style="margin:0; font-size:12px; color:${MUTED}; line-height:1.5;">
                To manage your notification preferences, visit your account settings on Perch.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${AMBER}; border-radius:8px; padding:12px 24px;">
      <a href="${href}" style="color:#000; font-size:14px; font-weight:600; text-decoration:none; display:inline-block;">${text}</a>
    </td>
  </tr>
</table>`
}

export function detailRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:6px 0; font-size:14px; color:${MUTED}; width:120px; vertical-align:top;">${label}</td>
  <td style="padding:6px 0; font-size:14px; color:#1a1a1a; font-weight:500;">${value}</td>
</tr>`
}

export { AMBER, DARK_BG, MUTED, BORDER }
