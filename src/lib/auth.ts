import { auth, currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, type User } from "@/lib/db/schema"

export type UserRole = "worker" | "cafe_owner" | "admin"

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (existing) return existing

  // User row missing — webhook may not have fired yet. Auto-create from Clerk.
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress
  if (!primaryEmail) return null

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || primaryEmail

  await db
    .insert(users)
    .values({
      id: userId,
      email: primaryEmail,
      name,
      avatarUrl: clerkUser.imageUrl || null,
      role: "worker",
    })
    .onConflictDoNothing()

  return (await db.query.users.findFirst({ where: eq(users.id, userId) })) ?? null
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth()

  if (user.role !== role) {
    throw new Error(`Forbidden: requires ${role} role`)
  }

  return user
}
