export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { getAdminBookings } from "@/lib/queries/admin"

export const metadata: Metadata = { title: "Bookings — Admin" }
import { AdminBookingsClient } from "@/components/admin/admin-bookings-client"

async function AdminBookingsPage() {
  const bookings = await getAdminBookings()

  return <AdminBookingsClient bookings={bookings} />
}

export { AdminBookingsPage as default }
