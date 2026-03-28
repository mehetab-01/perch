// Mock cafe data for search results and seeding
// Prices in paise (₹1 = 100 paise)

export type MockSpace = {
  id: string
  name: string
  capacityMin: number
  capacityMax: number
  pricePerHour: number // paise
  amenities: string[]
  noiseLevel: "quiet" | "moderate" | "lively"
  photos: string[]
}

export type MockCafe = {
  id: string
  name: string
  slug: string
  neighbourhood: string
  address: string
  city: string
  distance: string // e.g. "1.2 km"
  avgRating: number
  totalReviews: number
  coverPhoto: string // gradient fallback key
  spaces: MockSpace[]
  cheapestPrice: number // paise
  about: string
  openHours: string
}

export const MOCK_CAFES: MockCafe[] = [
  {
    id: "cafe-1",
    name: "The Bandra Brew",
    slug: "the-bandra-brew",
    neighbourhood: "Bandra West",
    address: "14, Hill Road, Bandra West, Mumbai",
    city: "Mumbai",
    distance: "1.2 km",
    avgRating: 4.8,
    totalReviews: 42,
    coverPhoto: "amber",
    about: "A cosy, sunlit space tucked inside a heritage building on Hill Road. Known for exceptional single-origin coffee and rock-solid fibre WiFi. Perfect for focused solo work or small team huddles.",
    openHours: "8 AM – 10 PM",
    cheapestPrice: 30000,
    spaces: [
      {
        id: "space-1a",
        name: "Focus Nook",
        capacityMin: 1,
        capacityMax: 4,
        pricePerHour: 30000,
        amenities: ["WiFi", "AC", "Power Outlets"],
        noiseLevel: "quiet",
        photos: [],
      },
      {
        id: "space-1b",
        name: "The Alcove",
        capacityMin: 4,
        capacityMax: 10,
        pricePerHour: 75000,
        amenities: ["WiFi", "AC", "Projector", "Whiteboard", "Power Outlets"],
        noiseLevel: "moderate",
        photos: [],
      },
    ],
  },
  {
    id: "cafe-2",
    name: "BKC Commons",
    slug: "bkc-commons",
    neighbourhood: "Bandra Kurla Complex",
    address: "G-Block, BKC, Mumbai",
    city: "Mumbai",
    distance: "3.5 km",
    avgRating: 4.6,
    totalReviews: 87,
    coverPhoto: "blue",
    about: "A premium co-working café in the heart of BKC's financial district. High-speed internet, private cabins, and a well-stocked pantry make this the go-to for serious business meetings.",
    openHours: "7 AM – 9 PM",
    cheapestPrice: 60000,
    spaces: [
      {
        id: "space-2a",
        name: "Boardroom",
        capacityMin: 6,
        capacityMax: 12,
        pricePerHour: 150000,
        amenities: ["WiFi", "AC", "Projector", "Whiteboard", "Power Outlets", "Video Conferencing"],
        noiseLevel: "quiet",
        photos: [],
      },
      {
        id: "space-2b",
        name: "Cabin Suite",
        capacityMin: 2,
        capacityMax: 6,
        pricePerHour: 60000,
        amenities: ["WiFi", "AC", "Power Outlets", "Standing Desk"],
        noiseLevel: "quiet",
        photos: [],
      },
    ],
  },
  {
    id: "cafe-3",
    name: "Juhu Social",
    slug: "juhu-social",
    neighbourhood: "Juhu",
    address: "6, JVPD Scheme, Juhu, Mumbai",
    city: "Mumbai",
    distance: "5.8 km",
    avgRating: 4.5,
    totalReviews: 61,
    coverPhoto: "green",
    about: "Beachside vibes with big screens and creative energy. Popular with media and entertainment professionals. The outdoor terrace is perfect for informal brainstorming sessions.",
    openHours: "9 AM – 11 PM",
    cheapestPrice: 25000,
    spaces: [
      {
        id: "space-3a",
        name: "Terrace Table",
        capacityMin: 2,
        capacityMax: 6,
        pricePerHour: 25000,
        amenities: ["WiFi", "Power Outlets"],
        noiseLevel: "lively",
        photos: [],
      },
      {
        id: "space-3b",
        name: "Media Room",
        capacityMin: 4,
        capacityMax: 8,
        pricePerHour: 90000,
        amenities: ["WiFi", "AC", "Large Screen", "Sound System", "Whiteboard"],
        noiseLevel: "moderate",
        photos: [],
      },
    ],
  },
  {
    id: "cafe-4",
    name: "Worli Grounds",
    slug: "worli-grounds",
    neighbourhood: "Worli",
    address: "Prabhadevi Road, Worli, Mumbai",
    city: "Mumbai",
    distance: "7.1 km",
    avgRating: 4.9,
    totalReviews: 29,
    coverPhoto: "purple",
    about: "Minimalist interiors with floor-to-ceiling glass overlooking the sea-link. An elevated experience for client meetings and pitch presentations. Recently renovated with top-tier AV equipment.",
    openHours: "8 AM – 8 PM",
    cheapestPrice: 80000,
    spaces: [
      {
        id: "space-4a",
        name: "Sea-View Suite",
        capacityMin: 4,
        capacityMax: 14,
        pricePerHour: 200000,
        amenities: ["WiFi", "AC", "Projector", "Whiteboard", "Power Outlets", "Video Conferencing", "Lounge Seating"],
        noiseLevel: "quiet",
        photos: [],
      },
      {
        id: "space-4b",
        name: "Quiet Corner",
        capacityMin: 1,
        capacityMax: 3,
        pricePerHour: 80000,
        amenities: ["WiFi", "AC", "Power Outlets"],
        noiseLevel: "quiet",
        photos: [],
      },
    ],
  },
]

export const COVER_GRADIENTS: Record<string, string> = {
  amber: "from-amber-600 via-orange-500 to-yellow-400",
  blue: "from-blue-700 via-indigo-600 to-violet-500",
  green: "from-emerald-600 via-teal-500 to-cyan-400",
  purple: "from-purple-700 via-fuchsia-600 to-pink-500",
}
