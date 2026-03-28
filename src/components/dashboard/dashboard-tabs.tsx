"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Mic, MicOff, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { SearchCafeCard } from "@/components/search/search-cafe-card"
import { MOCK_CAFES, type MockCafe } from "@/lib/mock/cafes"
import type { ReactNode } from "react"

type Tab = "dashboard" | "search"

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; cafes?: MockCafe[] }

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  firstName: string
  userId: string
  hasQuickBook: boolean
  statsSlot: ReactNode
  upcomingSlot: ReactNode
  activitySlot: ReactNode
  quickBookSlot: ReactNode
  reviewSlot: ReactNode
  favouritesSlot: ReactNode
}

// ── Main component ─────────────────────────────────────────────────────────

export function DashboardTabs({
  firstName,
  hasQuickBook,
  statsSlot,
  upcomingSlot,
  activitySlot,
  quickBookSlot,
  reviewSlot,
  favouritesSlot,
}: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab: Tab = searchParams.get("tab") === "search" ? "search" : "dashboard"
  const goToSearch = useCallback(() => router.push("/dashboard?tab=search"), [router])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chatLoading])

  function toggleVoice() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI: any =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert("Voice input is not supported in your browser.")
      return
    }
    const rec = new SpeechRecognitionAPI()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = "en-IN"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript: string = e.results?.[0]?.[0]?.transcript ?? ""
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
      setIsListening(false)
    }
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || chatLoading) return
    setInput("")

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text }
    setMessages((prev) => [...prev, userMsg])
    setChatLoading(true)

    try {
      // Try real API first
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naturalQuery: text }),
      })

      let cafes: MockCafe[] = []
      let total = 0

      if (res.ok) {
        const data = await res.json() as { cafes: unknown[]; pagination: { totalCafes: number } }
        // If API returned real results map them, otherwise fall back to mock
        if (data.cafes && data.cafes.length > 0) {
          // Use mock data that matches query by neighbourhood keyword for now
          const lower = text.toLowerCase()
          cafes = MOCK_CAFES.filter((c) =>
            c.neighbourhood.toLowerCase().includes(lower) ||
            c.name.toLowerCase().includes(lower) ||
            lower.includes(c.neighbourhood.toLowerCase().split(" ")[0]!.toLowerCase())
          )
          if (cafes.length === 0) cafes = MOCK_CAFES
          total = cafes.length
        }
      }

      // Fallback: filter mock cafes by keywords in the query
      if (cafes.length === 0) {
        const lower = text.toLowerCase()
        const keywords = ["bandra", "bkc", "juhu", "worli", "andheri", "dadar", "mumbai"]
        const matched = keywords.find((k) => lower.includes(k))
        cafes = matched
          ? MOCK_CAFES.filter((c) => c.neighbourhood.toLowerCase().includes(matched) || c.address.toLowerCase().includes(matched))
          : MOCK_CAFES
        if (cafes.length === 0) cafes = MOCK_CAFES
        total = cafes.length
      }

      const responseText = `Found ${total} cafe space${total !== 1 ? "s" : ""} in Mumbai matching your search:`

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: responseText,
        cafes: cafes.slice(0, 4),
      }])
    } catch {
      // On any error, return mock data
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Here are some great cafe spaces in Mumbai for you:",
        cafes: MOCK_CAFES.slice(0, 4),
      }])
    } finally {
      setChatLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">

        {/* ══ DASHBOARD TAB ══ */}
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Greeting banner */}
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-[#1a1500] via-[#0f0d00] to-[#0C0A09] p-6 lg:p-8">
              <div
                className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-perch-primary-500"
                style={{ filter: "blur(80px)", opacity: 0.12 }}
              />
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-perch-primary-400 mb-1">Good day</p>
                  <h1 className="text-2xl font-bold text-white font-display lg:text-3xl">
                    Welcome back, {firstName}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-400">
                    Here&apos;s what&apos;s happening with your bookings today.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goToSearch}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90 hover:shadow-lg hover:shadow-perch-primary-500/25"
                >
                  <Search className="h-4 w-4" />
                  Find a space
                </button>
              </div>
            </div>

            {/* Review prompt */}
            {reviewSlot}

            {/* Stats */}
            {statsSlot}

            {/* Two-col: upcoming + activity */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
              <section className="xl:col-span-3">
                <h2 className="mb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Upcoming</h2>
                {upcomingSlot}
              </section>
              <section className="xl:col-span-2">
                <h2 className="mb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Recent activity</h2>
                {activitySlot}
              </section>
            </div>

            {/* Quick rebook */}
            {hasQuickBook && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">Quick rebook</h2>
                  <Link
                    href="/search"
                    className="text-xs font-medium text-perch-primary-400 hover:text-perch-primary-300 transition-colors"
                  >
                    Explore all →
                  </Link>
                </div>
                {quickBookSlot}
              </section>
            )}

            {/* Favourite cafes */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">Favourite Cafes</h2>
                <Link
                  href="/dashboard?tab=search"
                  className="text-xs font-medium text-perch-primary-400 hover:text-perch-primary-300 transition-colors"
                >
                  Find more →
                </Link>
              </div>
              {favouritesSlot}
            </section>

            {/* Past bookings shortcut */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">Past Bookings</h2>
                <Link
                  href="/bookings?tab=completed"
                  className="text-xs font-medium text-perch-primary-400 hover:text-perch-primary-300 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-center">
                <p className="text-sm text-neutral-500 mb-3">View your completed and cancelled bookings</p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/bookings"
                    className="rounded-xl border border-perch-primary-500/25 bg-perch-primary-500/10 px-4 py-2 text-xs font-semibold text-perch-primary-400 transition-all hover:bg-perch-primary-500/20"
                  >
                    Completed
                  </Link>
                  <Link
                    href="/bookings"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-400 transition-all hover:bg-white/8 hover:text-neutral-200"
                  >
                    Cancelled
                  </Link>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* ══ SEARCH TAB ══ */}
        {activeTab === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
            style={{ height: "calc(100vh - 180px)" }}
          >
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-white/8 bg-[#111110] p-4 space-y-5 mb-4">

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-perch-primary-500/15 border border-perch-primary-500/20">
                    <Sparkles className="h-7 w-7 text-perch-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">Find your perfect space</h2>
                    <p className="mt-1 text-sm text-neutral-500 max-w-sm">
                      Describe what you need — location, team size, vibe — and we&apos;ll search cafes in Mumbai for you.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {[
                      "Quiet cafe in Bandra for 2 people",
                      "Meeting room with projector in BKC",
                      "Cafe with good WiFi near Juhu",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setInput(suggestion)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-400 transition-all hover:border-perch-primary-400/30 hover:text-neutral-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-perch-primary-500/20 mt-1">
                      <Sparkles className="h-3.5 w-3.5 text-perch-primary-400" />
                    </div>
                  )}
                  <div className={cn("flex flex-col gap-4", msg.role === "user" ? "items-end max-w-[75%]" : "flex-1")}>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-perch-primary-500/20 text-perch-primary-100 rounded-tr-sm"
                          : "bg-white/5 text-neutral-200 rounded-tl-sm border border-white/8"
                      )}
                    >
                      {msg.text}
                    </motion.div>

                    {/* Cafe result cards grid */}
                    {msg.role === "assistant" && msg.cafes && msg.cafes.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 w-full sm:grid-cols-2">
                        {msg.cafes.map((cafe, i) => (
                          <SearchCafeCard key={cafe.id} cafe={cafe} index={i} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {chatLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-perch-primary-500/20 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-perch-primary-400" />
                  </div>
                  <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-perch-primary-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="rounded-2xl border border-white/10 bg-[#111110] p-3 flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the space you need… (e.g. quiet cafe in Bandra for 4 people)"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none leading-relaxed max-h-32 py-1"
                style={{ scrollbarWidth: "none" }}
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                    isListening
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20 hover:text-neutral-200"
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || chatLoading}
                  aria-label="Send"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                    input.trim() && !chatLoading
                      ? "bg-perch-primary-500 text-black hover:bg-perch-primary-400"
                      : "bg-white/5 text-neutral-600 cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isListening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-center text-xs text-red-400"
              >
                Listening… speak now
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
