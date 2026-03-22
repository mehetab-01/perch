"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Repeat, Calendar } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import {
  generateRecurringDates,
  getDayName,
  getMaxRecurrenceEndDate,
} from "@/lib/recurring"
import type { RecurrencePattern } from "@/lib/recurring"

type RecurringToggleProps = {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  pattern: RecurrencePattern
  onPatternChange: (pattern: RecurrencePattern) => void
  endDate: string
  onEndDateChange: (date: string) => void
  startDate: string
  pricePerSession: number // paise
  disabled?: boolean
}

function RecurringToggle({
  enabled,
  onToggle,
  pattern,
  onPatternChange,
  endDate,
  onEndDateChange,
  startDate,
  pricePerSession,
  disabled = false,
}: RecurringToggleProps) {
  const maxEndDate = useMemo(
    () => (startDate ? getMaxRecurrenceEndDate(startDate) : ""),
    [startDate]
  )

  const preview = useMemo(() => {
    if (!startDate || !endDate) return null
    const dates = generateRecurringDates(startDate, pattern, endDate)
    if (dates.length < 2) return null
    const dayName = getDayName(startDate)
    return { dates, dayName, count: dates.length }
  }, [startDate, endDate, pattern])

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        disabled={disabled || !startDate}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          enabled
            ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
            : "border-border text-muted-foreground hover:border-perch-primary-300 hover:text-foreground"
        )}
        aria-pressed={enabled}
      >
        <Repeat className="size-4" />
        Make this recurring
        <div
          className={cn(
            "ml-auto h-5 w-9 rounded-full p-0.5 transition-colors",
            enabled ? "bg-perch-primary-500" : "bg-neutral-300 dark:bg-stone-600"
          )}
        >
          <motion.div
            className="size-4 rounded-full bg-white shadow-sm"
            animate={{ x: enabled ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </button>

      {/* Options (expanded when enabled) */}
      <AnimatePresence>
        {enabled && startDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              {/* Frequency */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Frequency
                </label>
                <div className="flex gap-2">
                  {(["weekly", "biweekly"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPatternChange(p)}
                      disabled={disabled}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-colors",
                        "disabled:opacity-50",
                        pattern === p
                          ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-700 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
                          : "border-border text-muted-foreground hover:border-perch-primary-300"
                      )}
                      aria-pressed={pattern === p}
                    >
                      {p === "weekly" ? "Every week" : "Every 2 weeks"}
                    </button>
                  ))}
                </div>
              </div>

              {/* End date */}
              <div>
                <label
                  htmlFor="recurring-end"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  <Calendar className="mr-1 inline size-3.5" />
                  Repeat until
                </label>
                <input
                  id="recurring-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  min={startDate}
                  max={maxEndDate}
                  disabled={disabled}
                  className={cn(
                    "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    "disabled:opacity-50"
                  )}
                />
              </div>

              {/* Preview */}
              {preview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-perch-primary-200 bg-perch-primary-50/50 p-3 dark:border-perch-primary-900 dark:bg-perch-primary-950/30"
                >
                  <p className="text-sm text-foreground">
                    <span className="font-medium">
                      Every {pattern === "biweekly" ? "other " : ""}
                      {preview.dayName}
                    </span>{" "}
                    · {preview.count} sessions
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    ₹{Math.round(pricePerSession / 100)} × {preview.count} ={" "}
                    <span className="text-perch-primary-600 dark:text-perch-primary-400">
                      ₹{Math.round((pricePerSession * preview.count) / 100)} total
                    </span>
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { RecurringToggle }
export type { RecurringToggleProps }
