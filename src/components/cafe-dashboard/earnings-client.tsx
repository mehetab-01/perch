"use client"

import {
  IndianRupee,
  TrendingUp,
  Clock,
  CalendarDays,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPaise, formatDateShort, formatDateMedium } from "@/lib/utils/format"
import type {
  CafeEarningsStats,
  CafeEarningsDay,
  CafeTransaction,
} from "@/types/cafe-dashboard"

type EarningsProps = {
  earningsStats: CafeEarningsStats
  dailyEarnings: CafeEarningsDay[]
  transactions: CafeTransaction[]
}

function nextFriday(): string {
  const now = new Date()
  const day = now.getDay()
  const daysUntilFriday = (5 - day + 7) % 7 || 7
  const friday = new Date(now)
  friday.setDate(now.getDate() + daysUntilFriday)
  return friday.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

const payoutStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  settled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
}

function CafeEarningsClient({
  earningsStats,
  dailyEarnings,
  transactions,
}: EarningsProps) {
  const maxDailyAmount = Math.max(...dailyEarnings.map((d) => d.amount), 1)
  const currentMonth = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Earnings</h1>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
            <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Total earned
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatPaise(earningsStats.totalEarned)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
            <IndianRupee className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              This month
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatPaise(earningsStats.earnedThisMonth)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
            <Wallet className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pending payout
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatPaise(earningsStats.pendingPayout)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950">
            <CalendarDays className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Next payout
            </p>
            <p className="text-lg font-bold text-foreground">
              {nextFriday()}
            </p>
          </div>
        </Card>
      </div>

      {/* Daily earnings chart */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Daily earnings — {currentMonth}
        </h2>
        <Card className="p-5">
          <div className="flex items-end gap-[2px] sm:gap-1" role="img" aria-label="Daily earnings bar chart">
            {dailyEarnings.map((day) => {
              const today = new Date().toISOString().split("T")[0]
              const isToday = day.date === today
              const barHeight =
                day.amount > 0
                  ? Math.max((day.amount / maxDailyAmount) * 120, 4)
                  : 2
              const dayNum = new Date(day.date + "T00:00:00").getDate()

              return (
                <div
                  key={day.date}
                  className="group relative flex flex-1 flex-col items-center"
                >
                  {/* Tooltip */}
                  {day.amount > 0 && (
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-stone-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-stone-700">
                      {formatPaise(day.amount)}
                    </div>
                  )}
                  <div className="flex h-[120px] items-end">
                    <div
                      className={cn(
                        "w-full rounded-t transition-all",
                        isToday
                          ? "bg-perch-primary-500 dark:bg-perch-primary-400"
                          : day.amount > 0
                            ? "bg-emerald-400 dark:bg-emerald-600"
                            : "bg-neutral-200 dark:bg-stone-700"
                      )}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  {/* Show day number on every 5th day and the 1st */}
                  {(dayNum === 1 || dayNum % 5 === 0) && (
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isToday
                          ? "font-bold text-perch-primary-600 dark:text-perch-primary-400"
                          : "text-neutral-400"
                      )}
                    >
                      {dayNum}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      {/* Transactions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Transactions
        </h2>

        {transactions.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <IndianRupee className="size-10 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No transactions yet
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tx.spaceName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDateShort(tx.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      payoutStatusStyles[tx.payoutStatus] ?? payoutStatusStyles.pending
                    )}
                  >
                    {tx.payoutStatus === "settled" ? "Paid" : "Pending"}
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {formatPaise(tx.cafePayout)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Payouts are settled weekly to your registered bank account
        </p>
      </section>
    </div>
  )
}

export { CafeEarningsClient }
