export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { getAdminUsers } from "@/lib/queries/admin"
import { AdminUsersClient } from "@/components/admin/admin-users-client"

export const metadata: Metadata = { title: "Users — Admin" }

async function AdminUsersPage() {
  const users = await getAdminUsers()

  return <AdminUsersClient users={users} />
}

export { AdminUsersPage as default }
