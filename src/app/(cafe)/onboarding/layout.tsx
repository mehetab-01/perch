import type { Metadata } from "next"

export const metadata: Metadata = { title: "List Your Cafe" }

function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { OnboardingLayout as default }
