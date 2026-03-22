import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ToastProvider } from "@/components/ui/toast"
import { InstallPrompt } from "@/components/layout/install-prompt"
import { ServiceWorkerRegister } from "@/components/layout/sw-register"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F59E0B",
}

export const metadata: Metadata = {
  title: {
    default: "Perch — Find your perch",
    template: "%s | Perch",
  },
  description:
    "Book meeting-ready cafe spaces in 2 minutes. Verified spaces, instant booking, no WeWork prices.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Perch",
  },
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
    apple: "/icons/apple-touch-icon.png",
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
          <ToastProvider>
            {children}
            <InstallPrompt />
            <ServiceWorkerRegister />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

export { RootLayout as default }
