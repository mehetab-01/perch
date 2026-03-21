import { getAdminBookings } from "@/lib/queries/admin"
import { AdminBookingsClient } from "@/components/admin/admin-bookings-client"

async function AdminBookingsPage() {
  const bookings = await getAdminBookings()

  return <AdminBookingsClient bookings={bookings} />
}

export { AdminBookingsPage as default }
