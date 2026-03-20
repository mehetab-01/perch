import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FeaturedSpaces } from "@/components/landing/featured-spaces"
import { TrustBar } from "@/components/landing/trust-bar"
import { CafeCta } from "@/components/landing/cafe-cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <HowItWorks />
      <FeaturedSpaces />
      <CafeCta />
      <Footer />
    </main>
  )
}
