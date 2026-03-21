import type { Metadata } from "next"
import { Suspense } from "react"
import { Container } from "@/components/ui/container"
import { SearchHeader } from "@/components/search/search-header"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"

export const metadata: Metadata = {
  title: "Search Meeting Spaces — Perch",
  description:
    "Find and book verified cafe meeting spaces near you. Filter by price, amenities, noise level, and more.",
  openGraph: {
    title: "Search Meeting Spaces — Perch",
    description:
      "Find and book verified cafe meeting spaces near you. Filter by price, amenities, noise level, and more.",
  },
}

function SearchPageFallback() {
  return (
    <div className="py-8">
      <div className="mb-6 h-14 animate-pulse rounded-xl bg-muted" />
      <div className="flex gap-6">
        <div className="hidden lg:block lg:w-72">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchPage() {
  return (
    <main className="min-h-screen bg-perch-light dark:bg-stone-950">
      <Container className="py-6">
        <Suspense fallback={<SearchPageFallback />}>
          <SearchHeader />
          <div className="mt-6 flex gap-6">
            <SearchFilters />
            <SearchResults />
          </div>
        </Suspense>
      </Container>
    </main>
  )
}

export default SearchPage
