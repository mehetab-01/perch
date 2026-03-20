# Next.js 15 Patterns for Perch

## Server Component (default)
```tsx
// src/app/(public)/page.tsx — NO "use client"
import { db } from "@/lib/db"

export default async function HomePage() {
  const featuredCafes = await db.query.cafes.findMany({
    where: eq(cafes.isActive, true),
    limit: 6,
    orderBy: desc(cafes.avgRating),
  })
  return <LandingPage cafes={featuredCafes} />
}
```

## Client Component (only when needed)
```tsx
// src/components/search/search-bar.tsx
"use client"
import { useState } from "react"
import { motion } from "framer-motion"

export function SearchBar() {
  const [query, setQuery] = useState("")
  // ...interactive logic
}
```

## API Route Pattern
```tsx
// src/app/api/cafes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { cafeSchema } from "@/lib/validators/cafe"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const validated = cafeSchema.safeParse(body)
  if (!validated.success) return NextResponse.json({ error: validated.error.flatten() }, { status: 400 })

  // ... db insert
  return NextResponse.json({ success: true }, { status: 201 })
}
```

## Route Groups
- (public) — landing, search, cafe profiles. No auth required.
- (auth) — sign-in, sign-up pages. Clerk components.
- (worker) — dashboard, bookings. Protected by Clerk middleware.
- (cafe) — cafe dashboard, space management. Protected + role check.
