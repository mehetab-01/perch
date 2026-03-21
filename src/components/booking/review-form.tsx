"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Loader2,
  Wifi,
  Volume2,
  Maximize,
  UserCheck,
  Star,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { StarRatingInput } from "@/components/ui/star-rating"
import { useToast } from "@/components/ui/toast"

type ReviewFormProps = {
  bookingId: string
  cafeName: string
  onClose: () => void
  onSuccess: () => void
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const BURST_COUNT = 20
const burstParticles = Array.from({ length: BURST_COUNT }, (_, i) => ({
  angle: (i / BURST_COUNT) * 360,
  distance: 40 + seededRandom(i) * 60,
  size: 4 + seededRandom(i + 100) * 6,
  delay: seededRandom(i + 200) * 0.3,
}))

function ReviewForm({ bookingId, cafeName, onClose, onSuccess }: ReviewFormProps) {
  const { toast } = useToast()

  const [overallRating, setOverallRating] = useState(0)
  const [wifiRating, setWifiRating] = useState(0)
  const [noiseRating, setNoiseRating] = useState(0)
  const [spaceRating, setSpaceRating] = useState(0)
  const [staffRating, setStaffRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (overallRating === 0) {
      toast("Please select an overall rating", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        bookingId,
        overallRating,
      }

      if (wifiRating > 0) body.wifiRating = wifiRating
      if (noiseRating > 0) body.noiseRating = noiseRating
      if (spaceRating > 0) body.spaceRating = spaceRating
      if (staffRating > 0) body.staffRating = staffRating
      if (comment.trim()) body.comment = comment.trim()

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Failed to submit review")
      }

      setShowSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to submit", "error")
    } finally {
      setIsSubmitting(false)
    }
  }, [
    bookingId,
    overallRating,
    wifiRating,
    noiseRating,
    spaceRating,
    staffRating,
    comment,
    toast,
    onSuccess,
  ])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => !isSubmitting && !showSuccess && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            /* Success state */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 p-10"
            >
              {/* Star burst */}
              <div className="relative flex size-20 items-center justify-center">
                {burstParticles.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                      y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                      scale: [0, 1.2, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: p.delay,
                      ease: "easeOut",
                    }}
                    className="absolute"
                  >
                    <Star
                      className="fill-amber-400 text-amber-400"
                      style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                      }}
                    />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                >
                  <Sparkles className="size-12 text-amber-500" />
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-foreground"
              >
                Thank you for your review!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-neutral-500 dark:text-neutral-400"
              >
                Your feedback helps others find great spaces.
              </motion.p>
            </motion.div>
          ) : (
            /* Form state */
            <motion.div key="form">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Rate your experience
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    at {cafeName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                <div className="space-y-6">
                  {/* Overall rating */}
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Overall experience
                    </p>
                    <div className="flex justify-center">
                      <StarRatingInput
                        value={overallRating}
                        onChange={setOverallRating}
                        size="lg"
                        disabled={isSubmitting}
                      />
                    </div>
                    {overallRating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-neutral-400"
                      >
                        {["", "Poor", "Fair", "Good", "Great", "Excellent"][overallRating]}
                      </motion.p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Attribute ratings */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Rate specific aspects (optional)
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
                        <Wifi className="size-4 shrink-0 text-neutral-400" />
                        <StarRatingInput
                          value={wifiRating}
                          onChange={setWifiRating}
                          size="sm"
                          label="WiFi"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
                        <Volume2 className="size-4 shrink-0 text-neutral-400" />
                        <StarRatingInput
                          value={noiseRating}
                          onChange={setNoiseRating}
                          size="sm"
                          label="Noise level"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
                        <Maximize className="size-4 shrink-0 text-neutral-400" />
                        <StarRatingInput
                          value={spaceRating}
                          onChange={setSpaceRating}
                          size="sm"
                          label="Space quality"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
                        <UserCheck className="size-4 shrink-0 text-neutral-400" />
                        <StarRatingInput
                          value={staffRating}
                          onChange={setStaffRating}
                          size="sm"
                          label="Staff"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label
                      htmlFor="review-comment"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Written review (optional)
                    </label>
                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience to help others..."
                      maxLength={500}
                      rows={3}
                      disabled={isSubmitting}
                      className={cn(
                        "w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-shadow",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "dark:border-stone-700"
                      )}
                    />
                    <p className="mt-1 text-right text-xs text-neutral-400">
                      {comment.length}/500
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-border px-6 py-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting || overallRating === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Star className="size-4" />
                  )}
                  Submit review
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export { ReviewForm }
export type { ReviewFormProps }
