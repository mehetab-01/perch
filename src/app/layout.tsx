import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Perch — Find your perch",
    template: "%s | Perch",
  },
  description:
    "Book meeting-ready cafe spaces in 2 minutes. Verified spaces, instant booking, no WeWork prices.",
  openGraph: {
    title: "Perch — Find your perch",
    description:
      "Book meeting-ready cafe spaces in 2 minutes. Verified spaces, instant booking, no WeWork prices.",
    url: "https://getperch.in",
    siteName: "Perch",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perch — Find your perch",
    description:
      "Book meeting-ready cafe spaces in 2 minutes. Verified spaces, instant booking, no WeWork prices.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://getperch.in"),
}

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

export default RootLayout
