"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Copy, Check, Save, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

type AgendaGeneratorProps = {
  meetingTitle: string
  durationHours: number
  attendees: number
  existingAgenda?: string | null
  onSave?: (agenda: string) => void
}

function AgendaGenerator({
  meetingTitle,
  durationHours,
  attendees,
  existingAgenda,
  onSave,
}: AgendaGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState("")
  const [generatedAgenda, setGeneratedAgenda] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const durationMinutes = Math.round(durationHours * 60)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/generate-agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingTitle,
          durationMinutes,
          attendees,
          context: context.trim() || undefined,
        }),
      })

      if (res.status === 429) {
        setError("You've reached the daily limit for AI generations. Try again tomorrow.")
        return
      }

      if (!res.ok) {
        setError("Failed to generate agenda. Please try again.")
        return
      }

      const data = await res.json()
      setGeneratedAgenda(data.agenda)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [meetingTitle, durationMinutes, attendees, context])

  const handleCopy = useCallback(async () => {
    if (!generatedAgenda) return
    await navigator.clipboard.writeText(generatedAgenda)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedAgenda])

  const handleSave = useCallback(() => {
    if (!generatedAgenda || !onSave) return
    onSave(generatedAgenda)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [generatedAgenda, onSave])

  // Show existing agenda if present and not generating
  if (existingAgenda && !isOpen) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-perch-primary-500" />
            <h3 className="font-semibold text-foreground">Meeting Agenda</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs text-perch-primary-600 dark:text-perch-primary-400"
          >
            <Sparkles className="size-3" />
            Regenerate
          </Button>
        </div>
        <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-neutral-700 dark:text-neutral-300">
          {existingAgenda}
        </pre>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-stone-900">
      {/* Prompt card */}
      {!isOpen && !existingAgenda && (
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-perch-primary-50 dark:bg-perch-primary-950/50">
              <Sparkles className="size-4 text-perch-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Prepare your meeting
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Generate a structured agenda with time allocations using AI.
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setIsOpen(true)}
              >
                <Sparkles className="size-3.5" />
                Generate agenda
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
                  <Sparkles className="size-4 text-perch-primary-500" />
                  <h3 className="font-semibold text-foreground">
                    Generate Agenda
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
                <span className="rounded-md bg-neutral-100 px-2.5 py-1 dark:bg-stone-800">
                  {attendees} {attendees === 1 ? "person" : "people"}
                </span>
              </div>

              {/* Context input */}
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Add context — e.g., 'client pitch for SaaS product', 'quarterly review with design team'..."
                className={cn(
                  "mt-4 w-full rounded-lg border border-border bg-transparent p-3 text-sm text-foreground",
                  "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-perch-primary-500/50",
                  "dark:border-stone-700"
                )}
                rows={2}
                maxLength={500}
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
                    Generate agenda
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
                {generatedAgenda && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="rounded-lg border border-perch-primary-200 bg-perch-primary-50/50 p-4 dark:border-perch-primary-900 dark:bg-perch-primary-950/30">
                      <pre className="whitespace-pre-wrap break-words text-sm text-foreground">
                        {generatedAgenda}
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
                      {onSave && (
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="flex-1"
                        >
                          {saved ? (
                            <>
                              <Check className="size-3.5" />
                              Saved!
                            </>
                          ) : (
                            <>
                              <Save className="size-3.5" />
                              Save to booking
                            </>
                          )}
                        </Button>
                      )}
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

export { AgendaGenerator }
export type { AgendaGeneratorProps }
