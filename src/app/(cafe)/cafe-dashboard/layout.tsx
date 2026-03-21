import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getOwnedCafe } from "@/lib/queries/cafe-dashboard"
import { CafeDashboardShell } from "@/components/layout/cafe-dashboard-shell"

export const metadata = {
  title: "Cafe Dashboard | Perch",
  description: "Manage your cafe spaces, bookings, and earnings",
}

async function CafeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cafe = await getOwnedCafe(userId)
  if (!cafe) redirect("/onboarding")

  return (
    <CafeDashboardShell
      cafeName={cafe.name}
      verificationStatus={cafe.verificationStatus}
    >
      {children}
    </CafeDashboardShell>
  )
}

export default CafeDashboardLayout
