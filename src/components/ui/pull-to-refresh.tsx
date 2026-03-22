"use client"

import { useState, useCallback, useRef } from "react"
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type PullToRefreshProps = {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

const PULL_THRESHOLD = 80
const MAX_PULL = 120

function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false)
  const pullY = useMotionValue(0)
  const spinnerOpacity = useTransform(pullY, [0, PULL_THRESHOLD * 0.5, PULL_THRESHOLD], [0, 0.5, 1])
  const spinnerScale = useTransform(pullY, [0, PULL_THRESHOLD], [0.5, 1])
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const pulling = useRef(false)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return
      const container = containerRef.current
      if (!container || container.scrollTop > 0) return
      startY.current = e.touches[0]!.clientY
      pulling.current = true
    },
    [refreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || refreshing) return
      const currentY = e.touches[0]!.clientY
      const diff = currentY - startY.current
      if (diff > 0) {
        const dampened = Math.min(diff * 0.5, MAX_PULL)
        pullY.set(dampened)
      }
    },
    [refreshing, pullY]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current || refreshing) return
    pulling.current = false

    if (pullY.get() >= PULL_THRESHOLD) {
      setRefreshing(true)
      pullY.set(PULL_THRESHOLD * 0.6)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        await controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } })
        pullY.set(0)
      }
    } else {
      pullY.set(0)
    }
  }, [refreshing, pullY, onRefresh, controls])

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Spinner */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2"
        style={{ opacity: spinnerOpacity, scale: spinnerScale, y: pullY }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md dark:bg-stone-800">
          <Loader2
            className={cn(
              "h-5 w-5 text-perch-primary-500",
              refreshing && "animate-spin"
            )}
          />
        </div>
      </motion.div>

      {/* Content pushed down during pull */}
      <motion.div style={{ y: pullY }}>
        {children}
      </motion.div>
    </div>
  )
}

export { PullToRefresh }
