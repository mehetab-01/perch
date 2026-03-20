import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FeaturedSpaces } from "@/components/landing/featured-spaces"
import { WhyPerch } from "@/components/landing/why-perch"
import { CafeCta } from "@/components/landing/cafe-cta"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Perch — Book Meeting-Ready Cafe Spaces in 2 Minutes",
  description:
    "Find and book verified cafe spaces for business meetings across Mumbai, Bengaluru, and Delhi. No calls, no walk-ins — instant confirmation with secure payments.",
  keywords: [
    "cafe meeting space",
    "book cafe for meeting",
    "coworking cafe",
    "meeting room Mumbai",
    "cafe workspace",
    "Perch",
  ],
  openGraph: {
    title: "Perch — Find Your Perch",
    description:
      "Book meeting-ready cafe spaces in 2 minutes. Verified spaces, instant booking, secure payments.",
    url: "https://perch.in",
    siteName: "Perch",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perch — Find Your Perch",
    description:
      "Book meeting-ready cafe spaces in 2 minutes. No calls, no walk-ins, no WeWork prices.",
  },
}

export function LandingPage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <FeaturedSpaces />
      <WhyPerch />
      <CafeCta />
      <Footer />
    </main>
  )
}

export default LandingPage
