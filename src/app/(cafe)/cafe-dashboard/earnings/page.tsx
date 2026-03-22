import type { Metadata } from "next"
import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getOwnedCafe,
  getCafeEarningsStats,
  getDailyEarnings,
  getCafeTransactions,
} from "@/lib/queries/cafe-dashboard"
import { CafeEarningsClient } from "@/components/cafe-dashboard/earnings-client"

export const metadata: Metadata = { title: "Earnings" }

function EarningsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800"
          />
        ))}
      </div>
    </div>
  )
}

async function EarningsContent() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cafe = await getOwnedCafe(userId)
  if (!cafe) redirect("/onboarding")

  const [earningsStats, dailyEarnings, transactions] = await Promise.all([
    getCafeEarningsStats(cafe.id),
    getDailyEarnings(cafe.id),
    getCafeTransactions(cafe.id),
  ])

  return (
    <CafeEarningsClient
      cafeId={cafe.id}
      earningsStats={earningsStats}
      dailyEarnings={dailyEarnings}
      transactions={transactions}
    />
  )
}

function CafeEarningsPage() {
  return (
    <Suspense fallback={<EarningsSkeleton />}>
      <EarningsContent />
    </Suspense>
  )
}

export { CafeEarningsPage as default }
