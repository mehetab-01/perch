import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { cafes, spaces, reviews, users } from "@/lib/db/schema"
import { Container } from "@/components/ui/container"
import { CafeInfo } from "@/components/cafe/cafe-info"
import { CafeAmenities } from "@/components/cafe/cafe-amenities"
import { CafeLocation } from "@/components/cafe/cafe-location"
import { CafeReviews } from "@/components/cafe/cafe-reviews"
import { CafePageClient } from "@/components/cafe/cafe-page-client"
import type { CafeWithDetails } from "@/types/cafe"

type CafePageProps = {
  params: Promise<{ slug: string }>
}

async function getCafe(slug: string): Promise<CafeWithDetails | null> {
  const cafeResult = await db
    .select()
    .from(cafes)
    .where(and(eq(cafes.slug, slug), eq(cafes.isActive, true)))
    .limit(1)

  const cafe = cafeResult[0]
  if (!cafe) return null

  const [cafeSpaces, cafeReviews] = await Promise.all([
    db
      .select()
      .from(spaces)
      .where(and(eq(spaces.cafeId, cafe.id), eq(spaces.isActive, true))),
    db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        workerId: reviews.workerId,
        cafeId: reviews.cafeId,
        overallRating: reviews.overallRating,
        wifiRating: reviews.wifiRating,
        noiseRating: reviews.noiseRating,
        spaceRating: reviews.spaceRating,
        staffRating: reviews.staffRating,
        comment: reviews.comment,
        cafeResponse: reviews.cafeResponse,
        isVisible: reviews.isVisible,
        createdAt: reviews.createdAt,
        workerName: users.name,
        workerAvatar: users.avatarUrl,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.workerId, users.id))
      .where(and(eq(reviews.cafeId, cafe.id), eq(reviews.isVisible, true)))
      .orderBy(reviews.createdAt),
  ])

  const reviewsWithAuthor = cafeReviews.map((r) => ({
    id: r.id,
    bookingId: r.bookingId,
    workerId: r.workerId,
    cafeId: r.cafeId,
    overallRating: r.overallRating,
    wifiRating: r.wifiRating,
    noiseRating: r.noiseRating,
    spaceRating: r.spaceRating,
    staffRating: r.staffRating,
    comment: r.comment,
    cafeResponse: r.cafeResponse,
    isVisible: r.isVisible,
    createdAt: r.createdAt,
    worker: {
      name: r.workerName,
      avatarUrl: r.workerAvatar,
    },
  }))

  return {
    ...cafe,
    spaces: cafeSpaces,
    reviews: reviewsWithAuthor,
  }
}

export async function generateMetadata({
  params,
}: CafePageProps): Promise<Metadata> {
  const { slug } = await params
  const cafe = await getCafe(slug)

  if (!cafe) {
    return { title: "Cafe not found — Perch" }
  }

  const description =
    cafe.description ??
    `Book a meeting space at ${cafe.name} in ${cafe.city}. Starting from ₹${
      cafe.spaces.length > 0
        ? Math.round(Math.min(...cafe.spaces.map((s) => s.pricePerHour)) / 100)
        : "—"
    }/hr.`

  return {
    title: `${cafe.name} — Perch`,
    description,
    openGraph: {
      title: `${cafe.name} — Perch`,
      description,
      type: "website",
    },
  }
}

async function CafePage({ params }: CafePageProps) {
  const { slug } = await params
  const cafe = await getCafe(slug)

  if (!cafe) {
    notFound()
  }

  const { userId } = await auth()
  const isSignedIn = !!userId

  return (
    <main className="min-h-screen bg-perch-light pb-24 dark:bg-stone-950 lg:pb-8">
      {/* Client-managed: hero + spaces + booking widget */}
      <CafePageClient cafe={cafe} isSignedIn={isSignedIn} />

      {/* Server-rendered sections */}
      <Container className="space-y-10">
        <CafeInfo cafe={cafe} spaces={cafe.spaces} />

        <CafeAmenities spaces={cafe.spaces} />

        <CafeReviews
          reviews={cafe.reviews}
          avgRating={cafe.avgRating}
          totalReviews={cafe.totalReviews}
        />

        <CafeLocation
          address={cafe.address}
          city={cafe.city}
          latitude={cafe.latitude}
          longitude={cafe.longitude}
        />
      </Container>
    </main>
  )
}

export default CafePage
