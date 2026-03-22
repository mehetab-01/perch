import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { getBookingById, hasReviewForBooking } from "@/lib/queries/dashboard"
import { BookingDetail } from "@/components/dashboard/booking-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return {
    title: `Booking ${id.slice(0, 8)} | Perch`,
    description: "View your booking details",
  }
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-100 dark:bg-stone-800" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800" />
      <div className="h-40 animate-pulse rounded-xl border border-border bg-neutral-100 dark:bg-stone-800" />
    </div>
  )
}

async function BookingDetailContent({ id }: { id: string }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const booking = await getBookingById(userId, id)
  if (!booking) notFound()

  const reviewExists = booking.status === "completed"
    ? await hasReviewForBooking(id)
    : false

  return <BookingDetail booking={booking} hasReview={reviewExists} />
}

async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BookingDetailContent id={id} />
    </Suspense>
  )
}

export { BookingDetailPage as default }
