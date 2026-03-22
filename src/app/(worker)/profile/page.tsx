import { Suspense } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getBookingsByStatus } from "@/lib/queries/dashboard"
import { ProfileClient } from "@/components/dashboard/profile-client"
import type { BookingWithDetails } from "@/types/dashboard"

export const metadata = {
  title: "Profile | Perch",
  description: "Your profile and booking history",
}

async function ProfileContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [dbUser, clerkUser, recentBookings] = await Promise.all([
    getCurrentUser(),
    currentUser(),
    getBookingsByStatus(userId, ["completed", "confirmed", "pending", "cancelled"], 20),
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
      bookings={recentBookings}
    />
  )
}

function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-32 animate-pulse rounded-2xl border border-border bg-neutral-100 dark:bg-stone-800" />
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-neutral-100 dark:bg-stone-800" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}

export { ProfilePage as default }
