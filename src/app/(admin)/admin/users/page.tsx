import { getAdminUsers } from "@/lib/queries/admin"
import { AdminUsersClient } from "@/components/admin/admin-users-client"

async function AdminUsersPage() {
  const users = await getAdminUsers()

  return <AdminUsersClient users={users} />
}

export { AdminUsersPage as default }
