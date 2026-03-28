"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ChevronRight, ChevronLeft, Calendar, Clock,
  Users, IndianRupee, Mail, Plus, Trash2, CheckCircle2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { MockCafe, MockSpace } from "@/lib/mock/cafes"

const PLATFORM_FEE_RATE = 0.05
const GST_RATE = 0.18

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00",
]

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number) as [number, number]
  const suffix = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
}

function getTodayString() {
  return new Date().toISOString().split("T")[0]!
}

function calcPricing(pricePerHour: number, duration: number) {
  const base = pricePerHour * duration
  const platformFee = Math.round(base * PLATFORM_FEE_RATE)
  const gst = Math.round((base + platformFee) * GST_RATE)
  const total = base + platformFee + gst
  return { base, platformFee, gst, total }
}

// ── Step 1: Confirm Details ────────────────────────────────────────────────

function Step1({
  cafe, space,
  date, setDate,
  startTime, setStartTime,
  duration, setDuration,
  people, setPeople,
}: {
  cafe: MockCafe
  space: MockSpace
  date: string; setDate: (v: string) => void
  startTime: string; setStartTime: (v: string) => void
  duration: number; setDuration: (v: number) => void
  people: number; setPeople: (v: number) => void
}) {
  const pricing = date && startTime ? calcPricing(space.pricePerHour, duration) : null

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">{space.name}</h3>
        <p className="text-sm text-neutral-500">{cafe.name} · {cafe.neighbourhood}</p>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          <Calendar className="inline h-3.5 w-3.5 mr-1" />Date
        </label>
        <input
          type="date"
          min={getTodayString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-perch-primary-500/50 focus:outline-none focus:ring-1 focus:ring-perch-primary-500/30 [color-scheme:dark]"
        />
      </div>

      {/* Time slots */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          <Clock className="inline h-3.5 w-3.5 mr-1" />Start Time
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setStartTime(slot)}
              className={cn(
                "rounded-lg border py-2 text-xs font-medium transition-all",
                startTime === slot
                  ? "border-perch-primary-500/50 bg-perch-primary-500/15 text-perch-primary-300"
                  : "border-white/8 bg-white/3 text-neutral-400 hover:border-white/15 hover:text-neutral-200"
              )}
            >
              {formatTime(slot)}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          Duration
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setDuration(h)}
              className={cn(
                "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
                duration === h
                  ? "border-perch-primary-500/50 bg-perch-primary-500/15 text-perch-primary-300"
                  : "border-white/8 bg-white/3 text-neutral-400 hover:border-white/15"
              )}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* People */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          <Users className="inline h-3.5 w-3.5 mr-1" />Number of People
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPeople(Math.max(1, people - 1))}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 flex items-center justify-center"
          >−</button>
          <span className="flex-1 text-center text-sm font-semibold text-white">{people} {people === 1 ? "person" : "people"}</span>
          <button
            type="button"
            onClick={() => setPeople(Math.min(space.capacityMax, people + 1))}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 flex items-center justify-center"
          >+</button>
        </div>
        <p className="mt-1 text-xs text-neutral-600">Capacity: {space.capacityMin}–{space.capacityMax} people</p>
      </div>

      {/* Price preview */}
      {pricing && (
        <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-sm">
          <div className="flex justify-between text-neutral-400">
            <span>₹{(space.pricePerHour / 100).toLocaleString("en-IN")}/hr × {duration}h</span>
            <span className="text-white">₹{(pricing.base / 100).toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 2: Meeting Details ────────────────────────────────────────────────

function Step2({
  title, setTitle,
  agenda, setAgenda,
  colleagues, setColleagues,
  newEmail, setNewEmail,
}: {
  title: string; setTitle: (v: string) => void
  agenda: string; setAgenda: (v: string) => void
  colleagues: string[]; setColleagues: (v: string[]) => void
  newEmail: string; setNewEmail: (v: string) => void
}) {
  function addEmail() {
    const email = newEmail.trim()
    if (!email || colleagues.includes(email)) return
    setColleagues([...colleagues, email])
    setNewEmail("")
  }

  function removeEmail(email: string) {
    setColleagues(colleagues.filter((e) => e !== email))
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-neutral-500">All fields are optional.</p>

      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          Meeting Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q2 Planning Session"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-perch-primary-500/50 focus:outline-none focus:ring-1 focus:ring-perch-primary-500/30"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          Agenda / Notes
        </label>
        <textarea
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder="What will you discuss?"
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-perch-primary-500/50 focus:outline-none focus:ring-1 focus:ring-perch-primary-500/30"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
          <Mail className="inline h-3.5 w-3.5 mr-1" />Invite Colleagues
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
            placeholder="colleague@company.com"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-perch-primary-500/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={addEmail}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-perch-primary-500/30 bg-perch-primary-500/10 text-perch-primary-400 hover:bg-perch-primary-500/20"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {colleagues.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {colleagues.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 pl-3 pr-2 py-1 text-xs text-neutral-300"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="text-neutral-600 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Review & Confirm ───────────────────────────────────────────────

function Step3({
  cafe, space, date, startTime, duration, people, title, agenda, colleagues,
}: {
  cafe: MockCafe; space: MockSpace
  date: string; startTime: string; duration: number; people: number
  title: string; agenda: string; colleagues: string[]
}) {
  const pricing = calcPricing(space.pricePerHour, duration)
  const endHour = parseInt(startTime.split(":")[0]!) + duration
  const endTime = `${String(endHour).padStart(2, "0")}:00`

  const dateLabel = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "—"

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-white">{cafe.name}</p>
            <p className="text-sm text-neutral-500">{space.name}</p>
          </div>
          <span className="text-xs rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2.5 py-1">Confirmed</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-neutral-600 mb-0.5">Date</p>
            <p className="text-neutral-200">{dateLabel}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-0.5">Time</p>
            <p className="text-neutral-200">{formatTime(startTime)} – {formatTime(endTime)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-0.5">Duration</p>
            <p className="text-neutral-200">{duration} hour{duration > 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-0.5">Attendees</p>
            <p className="text-neutral-200">{people} {people === 1 ? "person" : "people"}</p>
          </div>
        </div>

        {title && (
          <div>
            <p className="text-xs text-neutral-600 mb-0.5">Meeting</p>
            <p className="text-sm text-neutral-200">{title}</p>
          </div>
        )}

        {colleagues.length > 0 && (
          <div>
            <p className="text-xs text-neutral-600 mb-1">Invited</p>
            <div className="flex flex-wrap gap-1">
              {colleagues.map((e) => (
                <span key={e} className="text-xs rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-neutral-400">{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 space-y-2.5">
        <p className="text-sm font-semibold text-white mb-3">Price Breakdown</p>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Space cost (₹{(space.pricePerHour / 100).toLocaleString("en-IN")}/hr × {duration}h)</span>
          <span className="text-neutral-200">₹{(pricing.base / 100).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Platform fee (5%)</span>
          <span className="text-neutral-200">₹{(pricing.platformFee / 100).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">GST (18%)</span>
          <span className="text-neutral-200">₹{(pricing.gst / 100).toLocaleString("en-IN")}</span>
        </div>
        <div className="border-t border-white/8 pt-2.5 flex justify-between font-semibold">
          <span className="text-white">Total</span>
          <span className="text-perch-primary-300 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4" />
            {(pricing.total / 100).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <p className="text-xs text-neutral-600 text-center leading-relaxed px-2">
        Your saved payment method will be charged automatically after the meeting ends.
      </p>
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────────────────

const STEPS = ["Confirm Details", "Meeting Details", "Review & Confirm"]

type Props = {
  cafe: MockCafe
  space: MockSpace
  onClose: () => void
}

export function BookingModal({ cafe, space, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [confirming, setConfirming] = useState(false)

  // Step 1 state
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("10:00")
  const [duration, setDuration] = useState(2)
  const [people, setPeople] = useState(2)

  // Step 2 state
  const [title, setTitle] = useState("")
  const [agenda, setAgenda] = useState("")
  const [colleagues, setColleagues] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")

  function canProceed() {
    if (step === 0) return !!date && !!startTime && duration > 0
    return true
  }

  async function handleConfirm() {
    setConfirming(true)
    // Simulate booking creation with a small delay
    await new Promise((r) => setTimeout(r, 1200))
    const mockBookingId = `BK${Date.now().toString(36).toUpperCase()}`
    router.push(`/booking/confirmation?id=${mockBookingId}&cafe=${encodeURIComponent(cafe.name)}&space=${encodeURIComponent(space.name)}&date=${date}&time=${startTime}&duration=${duration}&total=${calcPricing(space.pricePerHour, duration).total}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#111110] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-xs text-perch-primary-400 font-medium uppercase tracking-wide">Step {step + 1} of 3</p>
            <h2 className="text-base font-semibold text-white">{STEPS[step]}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-perch-primary-400 to-perch-primary-500"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <Step1
                  cafe={cafe} space={space}
                  date={date} setDate={setDate}
                  startTime={startTime} setStartTime={setStartTime}
                  duration={duration} setDuration={setDuration}
                  people={people} setPeople={setPeople}
                />
              )}
              {step === 1 && (
                <Step2
                  title={title} setTitle={setTitle}
                  agenda={agenda} setAgenda={setAgenda}
                  colleagues={colleagues} setColleagues={setColleagues}
                  newEmail={newEmail} setNewEmail={setNewEmail}
                />
              )}
              {step === 2 && (
                <Step3
                  cafe={cafe} space={space}
                  date={date} startTime={startTime}
                  duration={duration} people={people}
                  title={title} agenda={agenda} colleagues={colleagues}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-5 py-4 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:border-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                canProceed()
                  ? "bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 text-black hover:opacity-90"
                  : "bg-white/5 text-neutral-600 cursor-not-allowed"
              )}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 py-2.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
            >
              {confirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
