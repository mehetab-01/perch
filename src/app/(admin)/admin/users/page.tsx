export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { getAdminUsers } from "@/lib/queries/admin"

export const metadata: Metadata = { title: "Users — Admin" }
import { AdminUsersClient } from "@/components/admin/admin-users-client"

async function AdminUsersPage() {
  const users = await getAdminUsers()

  return <AdminUsersClient users={users} />
}

export { AdminUsersPage as default }
