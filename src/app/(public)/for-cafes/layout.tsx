import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "List Your Cafe",
  description:
    "Turn your empty tables into a revenue stream. Join 100+ cafes earning ₹15,000–50,000/month from their off-peak hours on Perch.",
  openGraph: {
    title: "List Your Cafe on Perch",
    description:
      "Turn your empty tables into a revenue stream. Join 100+ cafes earning ₹15,000–50,000/month from their off-peak hours.",
  },
}

function ForCafesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { ForCafesLayout as default }
