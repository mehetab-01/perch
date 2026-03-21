"use client"

import Link from "next/link"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          An error occurred in the admin panel.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button asChild>
          <Link href="/admin">Back to admin</Link>
        </Button>
      </div>
    </div>
  )
}

export { AdminError as default }
