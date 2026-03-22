import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getBookingsByStatus } from "@/lib/queries/dashboard"
import { ProfileClient } from "@/components/dashboard/profile-client"

export const metadata = {
  title: "Profile | Perch",
  description: "Your profile and booking history",
}

async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [dbUser, clerkUser, bookings] = await Promise.all([
    getCurrentUser(),
    currentUser(),
    getBookingsByStatus(userId, ["completed", "confirmed", "pending", "cancelled", "checked_in"], 20),
  ])

  if (!dbUser) redirect("/sign-in")

  return (
    <ProfileClient
      user={{
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone ?? null,
        companyName: dbUser.companyName ?? null,
        avatarUrl: clerkUser?.imageUrl ?? dbUser.avatarUrl ?? null,
        role: dbUser.role,
        memberSince: dbUser.createdAt,
      }}
      bookings={bookings}
    />
  )
}

export { ProfilePage as default }
