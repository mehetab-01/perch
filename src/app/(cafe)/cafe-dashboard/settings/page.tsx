import type { Metadata } from "next"
import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"

export const metadata: Metadata = { title: "Settings" }
import { redirect } from "next/navigation"
import { getOwnedCafe } from "@/lib/queries/cafe-dashboard"
import { CafeSettingsClient } from "@/components/cafe-dashboard/settings-client"

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-neutral-100 dark:bg-stone-800" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
        />
      ))}
    </div>
  )
}

async function SettingsContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cafe = await getOwnedCafe(userId)
  if (!cafe) redirect("/onboarding")

  return <CafeSettingsClient cafe={cafe} />
}

function CafeSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  )
}

export { CafeSettingsPage as default }
