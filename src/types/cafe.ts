import type { Cafe, Space, Review, User } from "@/lib/db/schema"

export type CafeWithDetails = Cafe & {
  spaces: Space[]
  reviews: (Review & { worker: Pick<User, "name" | "avatarUrl"> })[]
}

export type ReviewWithAuthor = Review & {
  worker: Pick<User, "name" | "avatarUrl">
}
