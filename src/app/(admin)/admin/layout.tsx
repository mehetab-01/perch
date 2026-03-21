import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/queries/admin"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata = {
  title: "Admin Panel | Perch",
  description: "Perch platform administration",
}

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const hasAccess = await isAdmin(userId)
  if (!hasAccess) redirect("/dashboard")

  return <AdminShell>{children}</AdminShell>
}

export { AdminLayout as default }
