"use client"

import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { ArrowLeft } from "lucide-react"

export function SearchPageNav() {
  const { isSignedIn } = useAuth()

  return (
    <div className="flex items-center gap-3">
      <Link
        href={isSignedIn ? "/dashboard" : "/"}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-stone-800 dark:hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {isSignedIn ? "Back to Dashboard" : "Back to Home"}
      </Link>
      <span className="text-neutral-300 dark:text-neutral-600">/</span>
      <span className="text-sm font-medium text-foreground">Search Spaces</span>
    </div>
  )
}
