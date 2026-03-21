"use client"

import { useState } from "react"
import { Container } from "@/components/ui/container"
import { CafeHero } from "@/components/cafe/cafe-hero"
import { CafeSpaces } from "@/components/cafe/cafe-spaces"
import { BookingWidget } from "@/components/cafe/booking-widget"
import type { CafeWithDetails } from "@/types/cafe"

type CafePageClientProps = {
  cafe: CafeWithDetails
  isSignedIn: boolean
}

function CafePageClient({ cafe, isSignedIn }: CafePageClientProps) {
  const activeSpaces = cafe.spaces.filter((s) => s.isActive)
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(
    activeSpaces.length === 1 ? activeSpaces[0]!.id : null
  )

  // Collect all photos across spaces
  const allPhotos = activeSpaces.flatMap((s) => s.photos)

  return (
    <>
      <CafeHero cafeName={cafe.name} photos={allPhotos} />

      <Container className="py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main content */}
          <div className="flex-1 space-y-10 lg:min-w-0">
            <CafeSpaces
              spaces={cafe.spaces}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
            />
          </div>

          {/* Booking widget sidebar */}
          <div className="lg:w-[380px] lg:shrink-0">
            <BookingWidget
              spaces={cafe.spaces}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
              isSignedIn={isSignedIn}
            />
          </div>
        </div>
      </Container>
    </>
  )
}

export { CafePageClient }
export type { CafePageClientProps }
