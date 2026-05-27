import { Suspense } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "List Your Cafe" }

function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}

export { OnboardingLayout as default }
