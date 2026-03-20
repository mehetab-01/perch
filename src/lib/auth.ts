import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, type User } from "@/lib/db/schema"

export type UserRole = "worker" | "cafe_owner" | "admin"

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  return result ?? null
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
