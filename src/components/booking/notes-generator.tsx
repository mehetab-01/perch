"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Copy, Check, Download, Loader2, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

type NotesGeneratorProps = {
  meetingTitle: string
  durationHours: number
  existingAgenda?: string | null
}

function NotesGenerator({
  meetingTitle,
  durationHours,
  existingAgenda,
}: NotesGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [keyPoints, setKeyPoints] = useState("")
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const durationMinutes = Math.round(durationHours * 60)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingTitle,
          durationMinutes,
          agenda: existingAgenda?.trim() || undefined,
          keyPoints: keyPoints.trim() || undefined,
        }),
      })

      if (res.status === 429) {
        setError("You've reached the daily limit for AI generations. Try again tomorrow.")
        return
      }

      if (!res.ok) {
        setError("Failed to generate notes. Please try again.")
        return
      }

      const data = await res.json()
      setGeneratedNotes(data.notes)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [meetingTitle, durationMinutes, existingAgenda, keyPoints])

  const handleCopy = useCallback(async () => {
    if (!generatedNotes) return
    await navigator.clipboard.writeText(generatedNotes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedNotes])

  const handleDownload = useCallback(() => {
    if (!generatedNotes) return
    const blob = new Blob(
      [`${meetingTitle}\n${"=".repeat(meetingTitle.length)}\n\n${generatedNotes}`],
      { type: "text/plain" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-notes-${meetingTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [generatedNotes, meetingTitle])

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-stone-900">
      {/* Prompt card */}
      {!isOpen && (
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
              <FileText className="size-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Generate meeting notes
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Create structured notes with summary, decisions, and action items using AI.
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setIsOpen(true)}
              >
                <Sparkles className="size-3.5" />
                Generate notes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generator form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-blue-500" />
                  <h3 className="font-semibold text-foreground">
                    Generate Notes
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setError(null)
                  }}
                  className="rounded-md p-1 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Meeting info (read-only) */}
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-500">
                <span className="rounded-md bg-neutral-100 px-2.5 py-1 dark:bg-stone-800">
                  {meetingTitle}
                </span>
                <span className="rounded-md bg-neutral-100 px-2.5 py-1 dark:bg-stone-800">
                  {durationMinutes} min
                </span>
              </div>

              {/* Existing agenda hint */}
              {existingAgenda && (
                <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
                  <p className="mb-1 text-xs font-medium text-neutral-500">
                    Using saved agenda for context
                  </p>
                  <p className="line-clamp-3 text-xs text-neutral-400">
                    {existingAgenda}
                  </p>
                </div>
              )}

              {/* Key points input */}
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Jot down key points — e.g., 'decided to go with vendor A', 'John to send proposal by Friday', 'need follow-up meeting next week'..."
                className={cn(
                  "mt-4 w-full rounded-lg border border-border bg-transparent p-3 text-sm text-foreground",
                  "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "dark:border-stone-700"
                )}
                rows={4}
                maxLength={2000}
              />

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-3 w-full"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Generate notes
                  </>
                )}
              </Button>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}

              {/* Generated result */}
              <AnimatePresence>
                {generatedNotes && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                      <pre className="whitespace-pre-wrap break-words text-sm text-foreground">
                        {generatedNotes}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex-1"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="flex-1"
                      >
                        <Download className="size-3.5" />
                        Download
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { NotesGenerator }
export type { NotesGeneratorProps }
