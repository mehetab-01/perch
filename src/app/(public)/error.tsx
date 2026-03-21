"use client"

import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          We hit an unexpected error. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}

export { PublicError as default }
