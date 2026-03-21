"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { ReviewForm } from "@/components/booking/review-form"

type ReviewPromptProps = {
  bookingId: string
  cafeName: string
  /** "card" for booking detail page, "banner" for dashboard */
  variant?: "card" | "banner"
  onReviewed?: () => void
}

function ReviewPrompt({
  bookingId,
  cafeName,
  variant = "card",
  onReviewed,
}: ReviewPromptProps) {
  const [showForm, setShowForm] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [reviewed, setReviewed] = useState(false)

  if (reviewed || dismissed) return null

  return (
    <>
      {variant === "banner" ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative flex items-center gap-3 rounded-xl border border-perch-primary-200 bg-perch-primary-50 p-4 dark:border-perch-primary-800 dark:bg-perch-primary-950/50"
        >
          <Star className="size-5 shrink-0 text-perch-primary-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              How was your meeting at{" "}
              <span className="font-semibold">{cafeName}</span>?
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Your feedback helps other professionals find great spaces.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Star className="size-3.5" />
            Review
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 rounded-md p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      ) : (
        <div className="rounded-xl border border-perch-primary-200 bg-perch-primary-50 p-6 dark:border-perch-primary-800 dark:bg-perch-primary-950/50">
          <div className="flex items-start gap-3">
            <Star className="mt-0.5 size-5 text-perch-primary-500" />
            <div>
              <h3 className="font-semibold text-foreground">
                How was your experience?
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Leave a review to help other professionals find great spaces.
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setShowForm(true)}
              >
                <Star className="size-3.5" />
                Leave a review
              </Button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <ReviewForm
            bookingId={bookingId}
            cafeName={cafeName}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false)
              setReviewed(true)
              onReviewed?.()
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export { ReviewPrompt }
export type { ReviewPromptProps }
