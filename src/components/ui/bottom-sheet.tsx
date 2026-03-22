"use client"

import { useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Dismiss if dragged down more than 100px or with enough velocity
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl",
              "border-t border-border bg-white pb-safe dark:border-stone-700 dark:bg-stone-900",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pb-2 pt-3"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-stone-600" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 pb-3">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-stone-800"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="px-5 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export { BottomSheet }
