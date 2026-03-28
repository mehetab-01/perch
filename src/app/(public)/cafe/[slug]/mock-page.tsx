"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  MapPin, Star, Clock, Wifi, Projector, Wind, PenLine,
  Volume2, VolumeX, Volume1, Users, IndianRupee, ChevronLeft,
  ArrowRight, Camera
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { COVER_GRADIENTS, type MockCafe, type MockSpace } from "@/lib/mock/cafes"
import { BookingModal } from "@/components/booking/booking-modal"

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Projector: <Projector className="h-4 w-4" />,
  AC: <Wind className="h-4 w-4" />,
  Whiteboard: <PenLine className="h-4 w-4" />,
}

function NoiseBadge({ level }: { level: "quiet" | "moderate" | "lively" }) {
  const config = {
    quiet: { icon: <VolumeX className="h-3.5 w-3.5" />, label: "Quiet", cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
    moderate: { icon: <Volume1 className="h-3.5 w-3.5" />, label: "Moderate", cls: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
    lively: { icon: <Volume2 className="h-3.5 w-3.5" />, label: "Lively", cls: "border-red-500/20 bg-red-500/10 text-red-400" },
  }
  const { icon, label, cls } = config[level]
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium", cls)}>
      {icon}{label}
    </span>
  )
}

function StarRating({ rating, attribute }: { rating: number; attribute: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-400">{attribute}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn("h-3.5 w-3.5", s <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-700")}
          />
        ))}
        <span className="ml-1 text-xs text-neutral-500">{rating.toFixed(1)}</span>
      </div>
    </div>
  )
}

const MOCK_REVIEWS = [
  {
    id: "r1",
    author: "Priya S.",
    avatar: "PS",
    rating: 5,
    wifi: 5, noise: 5, space: 4, staff: 5,
    comment: "Absolutely loved this space! The WiFi was blazing fast and the staff were super helpful. Will definitely rebook.",
    date: "2 weeks ago",
  },
  {
    id: "r2",
    author: "Rahul M.",
    avatar: "RM",
    rating: 4,
    wifi: 4, noise: 4, space: 5, staff: 4,
    comment: "Great ambience for a client meeting. The projector worked perfectly. Only minor issue was the AC was a bit too cold.",
    date: "1 month ago",
  },
  {
    id: "r3",
    author: "Ananya K.",
    avatar: "AK",
    rating: 5,
    wifi: 5, noise: 5, space: 5, staff: 5,
    comment: "Best cafe workspace in the area. Clean, quiet, and professional. The team loved it.",
    date: "3 weeks ago",
  },
]

type Props = {
  cafe: MockCafe
}

export function MockCafePage({ cafe }: Props) {
  const gradient = COVER_GRADIENTS[cafe.coverPhoto] ?? COVER_GRADIENTS.amber!
  const [selectedSpace, setSelectedSpace] = useState<MockSpace | null>(cafe.spaces[0] ?? null)
  const [bookingOpen, setBookingOpen] = useState(false)

  const avgWifi = 4.7
  const avgNoise = 4.5
  const avgSpace = 4.6
  const avgStaff = 4.8

  return (
    <div className="min-h-screen bg-[#0C0A09] pb-24">
      {/* Back nav */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#0C0A09]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 lg:px-8">
          <Link
            href="/dashboard?tab=search"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className={cn("relative h-64 bg-gradient-to-br lg:h-80", gradient)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white font-display lg:text-3xl">{cafe.name}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="h-4 w-4" />
                  <span>{cafe.address}</span>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{cafe.avgRating}</span>
                  <span className="text-white/60 text-sm">({cafe.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/60">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{cafe.openHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-4 bottom-4 lg:hidden">
          <button className="flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
            <Camera className="h-3.5 w-3.5" />
            Photos
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">

          {/* Left: spaces + reviews + about */}
          <div className="flex-1 space-y-10 min-w-0">

            {/* Mobile rating */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{cafe.avgRating}</span>
                <span className="text-neutral-500 text-sm">({cafe.totalReviews})</span>
              </div>
              <span className="text-neutral-700">·</span>
              <div className="flex items-center gap-1 text-sm text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                {cafe.openHours}
              </div>
            </div>

            {/* Spaces */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-white font-display">Available Spaces</h2>
              <div className="space-y-4">
                {cafe.spaces.map((space) => (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedSpace(space)}
                    className={cn(
                      "cursor-pointer rounded-2xl border p-5 transition-all",
                      selectedSpace?.id === space.id
                        ? "border-perch-primary-500/40 bg-perch-primary-500/8"
                        : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{space.name}</h3>
                          <NoiseBadge level={space.noiseLevel} />
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-sm text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {space.capacityMin}–{space.capacityMax} people
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {space.amenities.map((a) => (
                            <span
                              key={a}
                              className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-neutral-400"
                            >
                              {AMENITY_ICONS[a] ?? null}
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-0.5 justify-end text-perch-primary-300 font-bold text-lg">
                          <IndianRupee className="h-4 w-4" />
                          {(space.pricePerHour / 100).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-neutral-500">per hour</div>
                      </div>
                    </div>

                    {selectedSpace?.id === space.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-perch-primary-500/20"
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setBookingOpen(true) }}
                          className="w-full rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90"
                        >
                          Book This Space
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            {/* About */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-white font-display">About</h2>
              <p className="text-sm leading-relaxed text-neutral-400">{cafe.about}</p>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{cafe.address} · {cafe.distance} from you</span>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-display">Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{cafe.avgRating}</span>
                  <span className="text-sm text-neutral-500">({cafe.totalReviews})</span>
                </div>
              </div>

              {/* Per-attribute ratings */}
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/8 bg-white/3 p-4">
                <StarRating rating={avgWifi} attribute="WiFi" />
                <StarRating rating={avgNoise} attribute="Noise Level" />
                <StarRating rating={avgSpace} attribute="Space" />
                <StarRating rating={avgStaff} attribute="Staff" />
              </div>

              <div className="space-y-4">
                {MOCK_REVIEWS.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl border border-white/8 bg-white/3 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-perch-primary-500/20 text-xs font-bold text-perch-primary-400">
                        {review.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-sm font-semibold text-white">{review.author}</span>
                          <span className="text-xs text-neutral-600">{review.date}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-700")} />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: sticky booking widget (desktop) */}
          <div className="hidden lg:block lg:w-[340px] lg:shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-white/8 bg-[#111110] p-5 space-y-5">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Starting from</p>
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-5 w-5 text-perch-primary-400" />
                    <span className="text-3xl font-bold text-perch-primary-300">
                      {(cafe.cheapestPrice / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="text-neutral-500 text-sm">/hr</span>
                  </div>
                </div>

                {/* Space selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Select Space</label>
                  {cafe.spaces.map((space) => (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => setSelectedSpace(space)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2.5 text-left transition-all",
                        selectedSpace?.id === space.id
                          ? "border-perch-primary-500/40 bg-perch-primary-500/10 text-perch-primary-300"
                          : "border-white/8 bg-white/3 text-neutral-300 hover:border-white/15"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{space.name}</span>
                        <span className="text-xs text-perch-primary-400">
                          ₹{(space.pricePerHour / 100).toLocaleString("en-IN")}/hr
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">{space.capacityMin}–{space.capacityMax} people</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 py-3 text-sm font-semibold text-black transition-all hover:opacity-90 hover:shadow-lg hover:shadow-perch-primary-500/25"
                >
                  Book Now
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-xs text-center text-neutral-600">
                  Free cancellation · 24hrs before your booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile book button */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-white/8 bg-[#0C0A09]/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs text-neutral-500">from </span>
            <span className="font-bold text-perch-primary-300">₹{(cafe.cheapestPrice / 100).toLocaleString("en-IN")}/hr</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-white">{cafe.avgRating}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="w-full rounded-xl bg-gradient-to-r from-perch-primary-400 to-perch-primary-500 py-3 text-sm font-semibold text-black"
        >
          Book a Space
        </button>
      </div>

      {/* Booking modal */}
      {bookingOpen && selectedSpace && (
        <BookingModal
          cafe={cafe}
          space={selectedSpace}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  )
}
