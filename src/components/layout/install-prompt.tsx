"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const DISMISS_KEY = "perch-install-dismissed"
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show on mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (!isMobile) return

    // Check if recently dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 safe-bottom",
            "border-t border-border bg-white/95 backdrop-blur-lg dark:border-stone-700 dark:bg-stone-900/95"
          )}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-perch-primary-100 dark:bg-perch-primary-950">
              <Download className="h-5 w-5 text-perch-primary-600 dark:text-perch-primary-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Add Perch to your home screen
              </p>
              <p className="text-xs text-muted-foreground">
                Quick access to book spaces instantly
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className={cn(
                  "rounded-lg bg-perch-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors",
                  "hover:bg-perch-primary-600 active:bg-perch-primary-700"
                )}
              >
                Install
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-stone-800"
                aria-label="Dismiss install prompt"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { InstallPrompt }
