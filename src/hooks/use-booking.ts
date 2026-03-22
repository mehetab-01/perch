"use client"

import { useState, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { loadRazorpayScript } from "@/lib/razorpay-client"
import { useToast } from "@/components/ui/toast"

type BookingData = {
  spaceId: string
  cafeId: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  numAttendees: number
  meetingTitle?: string
  agenda?: string
  isRecurring?: boolean
  recurrencePattern?: "weekly" | "biweekly"
  recurrenceEndDate?: string
}

type PaymentStatus = "idle" | "creating" | "checkout" | "verifying" | "success" | "failed"

type BookingState = {
  isLoading: boolean
  error: string | null
  bookingId: string | null
  paymentStatus: PaymentStatus
}

function useBooking() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [state, setState] = useState<BookingState>({
    isLoading: false,
    error: null,
    bookingId: null,
    paymentStatus: "idle",
  })

  const createBooking = useCallback(
    async (data: BookingData) => {
      setState({
        isLoading: true,
        error: null,
        bookingId: null,
        paymentStatus: "creating",
      })

      try {
        // 1. Create booking + Razorpay order
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          const msg = body?.error || "Failed to create booking"
          throw new Error(msg)
        }

        const { bookingId, orderId, amount, currency, keyId } =
          (await res.json()) as {
            bookingId: string
            orderId: string
            amount: number
            currency: string
            keyId: string
          }

        setState((s) => ({
          ...s,
          bookingId,
          paymentStatus: "checkout",
        }))

        // 2. Load Razorpay script
        await loadRazorpayScript()

        // 3. Open Razorpay checkout
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: keyId,
            amount,
            currency,
            name: "Perch",
            description: "Meeting space booking",
            order_id: orderId,
            prefill: {
              email: user?.primaryEmailAddress?.emailAddress ?? "",
              name:
                user?.fullName ??
                [user?.firstName, user?.lastName].filter(Boolean).join(" ") ??
                "",
            },
            theme: { color: "#F59E0B" },
            modal: {
              escape: false,
              confirm_close: true,
              ondismiss: () => {
                reject(new Error("Payment cancelled"))
              },
            },
            handler: () => {
              resolve()
            },
          })

          rzp.on("payment.failed", () => {
            reject(new Error("Payment failed. Please try again."))
          })

          rzp.open()
        })

        // 4. Payment succeeded — webhook will confirm on backend
        setState({
          isLoading: false,
          error: null,
          bookingId,
          paymentStatus: "success",
        })

        toast("Booking confirmed! Redirecting...", "success")

        // Give user a moment to see the success state, then redirect
        setTimeout(() => {
          router.push(`/bookings/${bookingId}?payment=success`)
        }, 600)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong"

        const isCancelled = message === "Payment cancelled"

        setState((s) => ({
          ...s,
          isLoading: false,
          error: isCancelled ? null : message,
          paymentStatus: isCancelled ? "idle" : "failed",
        }))

        if (isCancelled) {
          toast("Payment cancelled", "warning")
        } else {
          toast(message, "error")
        }
      }
    },
    [user, router, toast]
  )

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      bookingId: null,
      paymentStatus: "idle",
    })
  }, [])

  return { ...state, createBooking, reset }
}

export { useBooking }
export type { BookingData, PaymentStatus }
