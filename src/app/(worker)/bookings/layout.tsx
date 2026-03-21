import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Bookings" }

function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { BookingsLayout as default }
