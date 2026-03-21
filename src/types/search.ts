export type SearchSpace = {
  id: string
  name: string
  description: string | null
  capacityMin: number
  capacityMax: number
  pricePerHour: number // paise
  amenities: string[]
  noiseLevel: string
  photos: string[]
}

export type SearchCafe = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  city: string
  latitude: number
  longitude: number
  avgRating: number
  totalReviews: number
  distance: number | null
  spaces: SearchSpace[]
  cheapestPrice: number // paise
}

export type SearchResponse = {
  cafes: SearchCafe[]
  pagination: {
    page: number
    limit: number
    totalCafes: number
    totalPages: number
  }
}
