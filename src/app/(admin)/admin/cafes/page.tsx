export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { getAdminCafes } from "@/lib/queries/admin"

export const metadata: Metadata = { title: "Cafes — Admin" }
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
