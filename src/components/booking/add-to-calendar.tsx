"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { CalendarPlus, Download } from "lucide-react"
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateICSFile,
} from "@/lib/calendar"
import type { CalendarEventInput } from "@/lib/calendar"
import { cn } from "@/lib/utils/cn"

type AddToCalendarProps = {
  event: CalendarEventInput
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h4.2a3.6 3.6 0 0 1-1.6 2.4v2h2.5a7.6 7.6 0 0 0 2.4-6.2Z" fill="#4285F4" />
      <path d="M12 20a7.5 7.5 0 0 0 5.2-1.9l-2.5-2a4.8 4.8 0 0 1-7.1-2.5H5v2a8 8 0 0 0 7 4.4Z" fill="#34A853" />
      <path d="M7.5 13.6a4.6 4.6 0 0 1 0-3.2V8.5H5a8 8 0 0 0 0 7.2l2.5-2Z" fill="#FBBC05" />
      <path d="M12 7.4a4.3 4.3 0 0 1 3.1 1.2l2.3-2.3A7.7 7.7 0 0 0 5 8.5l2.5 2a4.8 4.8 0 0 1 4.5-3.1Z" fill="#EA4335" />
    </svg>
  )
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" fill="#0078D4" />
      <path d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm0 9.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="#fff" />
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" fill="#0078D4" />
    </svg>
  )
}

function AddToCalendar({ event }: AddToCalendarProps) {
  const googleUrl = generateGoogleCalendarUrl(event)
  const outlookUrl = generateOutlookCalendarUrl(event)

  const handleICSDownload = useCallback(() => {
    const icsContent = generateICSFile(event)
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `perch-booking-${event.id.slice(0, 8)}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [event])

  const buttonClasses = cn(
    "flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors",
    "hover:border-perch-primary-200 hover:bg-perch-primary-50 dark:bg-stone-900 dark:hover:border-perch-primary-800 dark:hover:bg-stone-800",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400"
  )

  return (
    <div className="rounded-xl border border-border bg-white p-6 dark:bg-stone-900">
      <div className="mb-4 flex items-center gap-2">
        <CalendarPlus className="h-5 w-5 text-perch-primary-500" />
        <h2 className="font-semibold text-foreground">Add to Calendar</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <GoogleIcon className="h-5 w-5" />
          Google Calendar
        </motion.a>

        <motion.a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <OutlookIcon className="h-5 w-5" />
          Outlook
        </motion.a>

        <motion.button
          type="button"
          onClick={handleICSDownload}
          className={buttonClasses}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="h-4 w-4" />
          Download .ics
        </motion.button>
      </div>

      {event.isRecurring && (
        <p className="mt-3 text-xs text-neutral-500">
          {event.recurrencePattern === "biweekly" ? "Biweekly" : "Weekly"} recurring event will be added to your calendar.
        </p>
      )}
    </div>
  )
}

export { AddToCalendar }
