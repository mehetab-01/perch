import type { Metadata } from "next"
import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getOwnedCafeWithSpaces } from "@/lib/queries/cafe-dashboard"
import { CafeSpacesClient } from "@/components/cafe-dashboard/spaces-client"

export const metadata: Metadata = { title: "Spaces" }

function SpacesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-neutral-100 dark:bg-stone-800" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-neutral-100 dark:bg-stone-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
    </div>
  )
}

async function SpacesContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const result = await getOwnedCafeWithSpaces(userId)
  if (!result) redirect("/onboarding")

  return (
    <CafeSpacesClient cafeId={result.cafe.id} initialSpaces={result.spaces} />
  )
}

function CafeSpacesPage() {
  return (
    <Suspense fallback={<SpacesSkeleton />}>
      <SpacesContent />
    </Suspense>
  )
}

export { CafeSpacesPage as default }
