"use client"

import { useState } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Camera, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"

// Deterministic gradients from cafe name
function nameToGradients(name: string): string[] {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const palettes = [
    ["from-amber-400 to-orange-500", "from-amber-300 to-yellow-500", "from-orange-400 to-red-400"],
    ["from-emerald-400 to-teal-500", "from-teal-300 to-cyan-500", "from-green-400 to-emerald-500"],
    ["from-violet-400 to-purple-500", "from-purple-300 to-indigo-500", "from-indigo-400 to-blue-500"],
    ["from-rose-400 to-pink-500", "from-pink-300 to-fuchsia-500", "from-rose-400 to-orange-400"],
  ]
  return palettes[hash % palettes.length]!
}

type CafeHeroProps = {
  cafeName: string
  photos: string[] // all photos across spaces
}

function CafeHero({ cafeName, photos }: CafeHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const gradients = nameToGradients(cafeName)

  // Use photos if available, otherwise use gradient placeholders
  const hasPhotos = photos.length > 0
  const totalSlides = hasPhotos ? photos.length : gradients.length

  const goTo = (index: number) => {
    setCurrentIndex((index + totalSlides) % totalSlides)
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x < -threshold) {
      goTo(currentIndex + 1)
    } else if (info.offset.x > threshold) {
      goTo(currentIndex - 1)
    }
  }

  return (
    <section aria-label="Cafe photos">
      {/* Desktop: grid layout */}
      <div className="relative hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-2 md:h-[420px] md:rounded-xl md:overflow-hidden">
        {/* Large photo */}
        <div
          role="img"
          aria-label={hasPhotos ? `Photo of ${cafeName}` : `${cafeName} placeholder`}
          className={cn(
            "col-span-2 row-span-2 relative bg-gradient-to-br",
            !hasPhotos && gradients[0]
          )}
          style={hasPhotos ? { backgroundImage: `url(${photos[0]})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {!hasPhotos && (
              <span aria-hidden="true" className="text-6xl font-display font-bold text-white/70">
                {cafeName.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Small photos */}
        {[1, 2].map((i) => (
          <div
            key={i}
            role="img"
            aria-label={hasPhotos && photos[i] ? `Photo ${i + 1} of ${cafeName}` : `${cafeName} placeholder ${i + 1}`}
            className={cn(
              "col-span-2 relative bg-gradient-to-br",
              !hasPhotos && (gradients[i] ?? gradients[0])
            )}
            style={
              hasPhotos && photos[i]
                ? { backgroundImage: `url(${photos[i]})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!hasPhotos && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="size-8 text-white/30" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        {/* View all photos button */}
        <button
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-medium text-stone-900 shadow-md backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-stone-800/90 dark:text-stone-100 dark:hover:bg-stone-800"
          aria-label="View all photos"
          onClick={() => {/* lightbox will be added later */}}
        >
          <Camera className="size-4" aria-hidden="true" />
          View all photos
        </button>
      </div>

      {/* Mobile: swipe carousel */}
      <div className="relative md:hidden aspect-[4/3] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="img"
            aria-label={hasPhotos ? `Photo ${currentIndex + 1} of ${cafeName}` : `${cafeName} placeholder`}
            className={cn(
              "absolute inset-0 bg-gradient-to-br cursor-grab active:cursor-grabbing",
              !hasPhotos && gradients[currentIndex % gradients.length]
            )}
            style={
              hasPhotos && photos[currentIndex]
                ? { backgroundImage: `url(${photos[currentIndex]})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!hasPhotos && (
              <div className="flex h-full items-center justify-center">
                <span aria-hidden="true" className="text-5xl font-display font-bold text-white/70">
                  {cafeName.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: Math.min(totalSlides, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "size-2 rounded-full transition-all",
                  i === currentIndex
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/70"
                )}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Nav arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export { CafeHero }
export type { CafeHeroProps }
