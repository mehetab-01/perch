"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

// ── Types ──

type ToastVariant = "success" | "error" | "info" | "warning"

type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void
}

// ── Context ──

const ToastContext = createContext<ToastContextValue | null>(null)

function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

// ── Variant config ──

const variantStyles: Record<
  ToastVariant,
  { bg: string; icon: typeof CheckCircle }
> = {
  success: {
    bg: "border-emerald-500/30 bg-emerald-950/90 text-emerald-100",
    icon: CheckCircle,
  },
  error: {
    bg: "border-red-500/30 bg-red-950/90 text-red-100",
    icon: XCircle,
  },
  info: {
    bg: "border-blue-500/30 bg-blue-950/90 text-blue-100",
    icon: Info,
  },
  warning: {
    bg: "border-amber-500/30 bg-amber-950/90 text-amber-100",
    icon: AlertTriangle,
  },
}

// ── Single toast item ──

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const config = variantStyles[t.variant]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className={cn(
        "pointer-events-auto flex w-80 items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md",
        config.bg
      )}
      role="alert"
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  )
}

// ── Provider ──

let toastCounter = 0

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = `toast-${++toastCounter}`
      setToasts((prev) => [...prev, { id, message, variant }])

      // Auto-dismiss after 4 seconds
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — top-right */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end gap-2 p-4 pt-16 sm:p-6 sm:pt-20"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export { ToastProvider, useToast }
export type { ToastVariant, Toast }
