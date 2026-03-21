import { getAdminCafes } from "@/lib/queries/admin"
import { AdminCafesClient } from "@/components/admin/admin-cafes-client"

async function AdminCafesPage() {
  const [pending, verified, rejected] = await Promise.all([
    getAdminCafes("pending"),
    getAdminCafes("verified"),
    getAdminCafes("rejected"),
  ])

  return (
    <AdminCafesClient
      pending={pending}
      verified={verified}
      rejected={rejected}
    />
  )
}

export { AdminCafesPage as default }
