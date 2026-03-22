import { config } from "dotenv"
import path from "node:path"

// Load .env.local (Next.js convention — not auto-loaded by standalone scripts)
config({ path: path.resolve(process.cwd(), ".env.local") })
config({ path: path.resolve(process.cwd(), ".env") })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq, inArray } from "drizzle-orm"
import * as schema from "./schema"
import {
  randomBetween,
  randomFrom,
  randomSubset,
  daysAgo,
  daysFromNow,
  formatDate,
  generateSlug,
  calculateBookingAmounts,
} from "./seed-utils"

// ─── DB connection ───────────────────────────────────────────────────────────

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Create a .env.local file.")
  process.exit(1)
}

const sql = neon(databaseUrl)
const db = drizzle(sql, { schema })

// ─── Constants ───────────────────────────────────────────────────────────────

const DEMO_USER_IDS = [
  "user_worker_demo",
  "user_cafe_demo",
  "user_admin_demo",
] as const

const AMENITIES_POOL = [
  "wifi",
  "projector",
  "whiteboard",
  "power_outlets",
  "ac",
  "parking",
  "beverages",
  "printer",
  "tv_screen",
] as const

const MEETING_TITLES = [
  "Q2 Strategy Review",
  "Client Pitch — Acme Corp",
  "Team Weekly Sync",
  "Investor Update",
  "Product Roadmap Planning",
  "1:1 with Manager",
  "Design Sprint Kickoff",
  "Quarterly Business Review",
  "Engineering Standup",
  "Partnership Discussion",
  "Budget Planning Session",
  "Hiring Pipeline Review",
  null,
  null,
  null,
]

const REVIEW_COMMENTS = [
  "Great WiFi and quiet corner. Perfect for our client call.",
  "Loved the ambiance. Coffee was amazing too. Will definitely book again.",
  "Space was good but the AC was a bit too cold. Staff was super helpful though.",
  "Exactly what we needed for a quick team sync. Projector worked perfectly.",
  "Slightly noisy during lunch hour but otherwise a great spot.",
  "The private room was perfect for our investor meeting. Very professional.",
  "Good value for the price. WiFi could be faster but overall solid experience.",
  "Beautiful space with great natural light. Would highly recommend for creative meetings.",
  "Smooth booking process. The space was clean, well-lit, and ready to go.",
  "Perfect for a 2-hour strategy session. Barista even brought us refills without asking.",
  "A bit cramped for 6 people but the vibe was fantastic. Great coffee.",
  "Easily the best meeting space in BKC. Will be a regular here.",
  "The rooftop section is gorgeous. Made our team offsite feel special.",
  "Parking was a hassle but the cafe itself is excellent. Would book the private room again.",
  "Very quiet, great for focused work sessions. Power outlets at every seat.",
  "Staff went above and beyond to accommodate our last-minute AV setup.",
  "Decent spot for a casual catch-up. Not ideal for serious business meetings.",
  "The industrial aesthetic is very cool. Clients were impressed.",
  "Fast WiFi, comfortable seating, and unlimited coffee — what more do you need?",
  "Booked for a 3-hour sprint and it flew by. The space just works.",
]

const CAFE_RESPONSES = [
  "Thank you for the kind words! We're glad the space worked well for your meeting.",
  "We appreciate the feedback! We've noted the AC concern and adjusted it.",
  "Thanks for choosing us! Looking forward to hosting you again.",
  "So happy to hear that! Our baristas take pride in the service.",
  "Thank you! We've been working hard on the WiFi — glad it delivered.",
  null,
  null,
  null,
  null,
  null,
]

const BOOKING_TIMES = [
  { start: "09:00", end: "10:00", hours: 1 },
  { start: "10:00", end: "11:00", hours: 1 },
  { start: "10:00", end: "12:00", hours: 2 },
  { start: "11:00", end: "13:00", hours: 2 },
  { start: "13:00", end: "14:00", hours: 1 },
  { start: "14:00", end: "16:00", hours: 2 },
  { start: "14:00", end: "17:00", hours: 3 },
  { start: "15:00", end: "17:00", hours: 2 },
  { start: "16:00", end: "18:00", hours: 2 },
  { start: "10:00", end: "13:00", hours: 3 },
]

// ─── Cafe data ───────────────────────────────────────────────────────────────

type CafeSeed = {
  name: string
  area: string
  address: string
  latitude: number
  longitude: number
  description: string
  noiseLevel: "quiet" | "moderate" | "lively"
  pricePerHour: number // in paise
  avgRating: number
  totalReviews: number
}

const CAFES: CafeSeed[] = [
  // ── Bandra West (5) ──
  {
    name: "The Brew Studio",
    area: "Bandra West",
    address: "14th Road, Bandra West, Mumbai 400050",
    latitude: 19.0596,
    longitude: 72.8295,
    description:
      "A specialty coffee house tucked into a quiet lane in Bandra. Known for single-origin pour-overs and a calm, focused atmosphere — ideal for client meetings when you need zero distractions.",
    noiseLevel: "quiet",
    pricePerHour: 40000,
    avgRating: 4.7,
    totalReviews: 32,
  },
  {
    name: "Third Wave Coffee",
    area: "Bandra West",
    address: "Hill Road, Bandra West, Mumbai 400050",
    latitude: 19.0544,
    longitude: 72.8268,
    description:
      "Modern cafe chain with reliable WiFi and a bright, airy interior. Popular with remote workers and freelancers — the upstairs section is quieter and great for small meetings.",
    noiseLevel: "moderate",
    pricePerHour: 35000,
    avgRating: 4.3,
    totalReviews: 28,
  },
  {
    name: "Subko Coffee",
    area: "Bandra West",
    address: "Waroda Road, Bandra West, Mumbai 400050",
    latitude: 19.059,
    longitude: 72.828,
    description:
      "Artisan micro-roastery with an industrial-meets-minimal design. The tasting counter doubles as a meeting table, and the aroma of freshly roasted beans sets a creative mood.",
    noiseLevel: "quiet",
    pricePerHour: 45000,
    avgRating: 4.8,
    totalReviews: 19,
  },
  {
    name: "The Village Shop",
    area: "Bandra West",
    address: "Pali Hill, Bandra West, Mumbai 400050",
    latitude: 19.062,
    longitude: 72.831,
    description:
      "Health-forward cafe on Pali Hill with organic juices and wholesome meals. The back room has a dedicated workspace area with standing desks — perfect for all-day strategy sessions.",
    noiseLevel: "quiet",
    pricePerHour: 50000,
    avgRating: 4.5,
    totalReviews: 15,
  },
  {
    name: "Blue Tokai Coffee",
    area: "Bandra West",
    address: "Linking Road, Bandra West, Mumbai 400050",
    latitude: 19.057,
    longitude: 72.8255,
    description:
      "India's beloved specialty roaster with a spacious Bandra outpost. Strong WiFi, natural light through floor-to-ceiling windows, and some of the best cold brew in the city.",
    noiseLevel: "moderate",
    pricePerHour: 40000,
    avgRating: 4.6,
    totalReviews: 41,
  },
  // ── BKC (4) ──
  {
    name: "SOCIAL BKC",
    area: "BKC",
    address: "Capital Building, BKC, Mumbai 400051",
    latitude: 19.058,
    longitude: 72.864,
    description:
      "The original coworking-meets-cafe concept in Mumbai. High-energy space with fast WiFi, large communal tables, and a vibe that fuels brainstorming. Best booked during off-peak for focused work.",
    noiseLevel: "lively",
    pricePerHour: 60000,
    avgRating: 4.2,
    totalReviews: 45,
  },
  {
    name: "Starbucks BKC",
    area: "BKC",
    address: "Trade Centre, BKC, Mumbai 400051",
    latitude: 19.0565,
    longitude: 72.8625,
    description:
      "Flagship Starbucks in the heart of BKC's financial district. Predictable quality with comfortable seating, reliable WiFi, and a professional atmosphere suited for business meetings.",
    noiseLevel: "moderate",
    pricePerHour: 50000,
    avgRating: 4.1,
    totalReviews: 38,
  },
  {
    name: "The Table BKC",
    area: "BKC",
    address: "Maker Maxity, BKC, Mumbai 400051",
    latitude: 19.059,
    longitude: 72.866,
    description:
      "Premium dining space in Maker Maxity that doubles as an impressive meeting venue. The private dining area can be reserved for client-facing meetings that need to make a statement.",
    noiseLevel: "quiet",
    pricePerHour: 80000,
    avgRating: 4.9,
    totalReviews: 12,
  },
  {
    name: "Koffee Kulture",
    area: "BKC",
    address: "Plot C-68, BKC, Mumbai 400051",
    latitude: 19.0575,
    longitude: 72.865,
    description:
      "Boutique cafe with a curated interior and excellent filter coffee. Quiet enough for video calls, with dedicated power outlets at every table. A hidden gem in BKC.",
    noiseLevel: "quiet",
    pricePerHour: 55000,
    avgRating: 4.6,
    totalReviews: 22,
  },
  // ── Andheri (4) ──
  {
    name: "Filter Coffee Co",
    area: "Andheri West",
    address: "Juhu Lane, Andheri West, Mumbai 400058",
    latitude: 19.1197,
    longitude: 72.8464,
    description:
      "South Indian coffee specialist with a modern twist. The upstairs loft has a cozy meeting nook with a whiteboard — popular with startup teams for morning standups over filter kaapi.",
    noiseLevel: "moderate",
    pricePerHour: 30000,
    avgRating: 4.4,
    totalReviews: 35,
  },
  {
    name: "Leaping Windows",
    area: "Andheri West",
    address: "Versova Road, Andheri West, Mumbai 400058",
    latitude: 19.118,
    longitude: 72.844,
    description:
      "Board game and comic book cafe with a creative, eclectic vibe. The mezzanine level is surprisingly quiet and makes for a fun, unconventional meeting spot. Great ice-breaker energy.",
    noiseLevel: "moderate",
    pricePerHour: 35000,
    avgRating: 4.3,
    totalReviews: 27,
  },
  {
    name: "SOCIAL Andheri",
    area: "Andheri West",
    address: "New Link Road, Andheri West, Mumbai 400053",
    latitude: 19.119,
    longitude: 72.845,
    description:
      "The Andheri outpost of SOCIAL with high ceilings, exposed brick, and plenty of plug points. Daytime crowd is mostly laptop workers, making it a productive spot for team syncs.",
    noiseLevel: "lively",
    pricePerHour: 40000,
    avgRating: 4.0,
    totalReviews: 42,
  },
  {
    name: "Birdsong Cafe",
    area: "Andheri West",
    address: "Oshiwara, Andheri West, Mumbai 400053",
    latitude: 19.121,
    longitude: 72.847,
    description:
      "Organic cafe with a garden patio that feels miles from the city. The indoor section has soundproofed corners perfect for calls. Their avocado toast is the best pre-meeting fuel.",
    noiseLevel: "quiet",
    pricePerHour: 45000,
    avgRating: 4.7,
    totalReviews: 18,
  },
  // ── Lower Parel (4) ──
  {
    name: "Cafe Zoe",
    area: "Lower Parel",
    address: "Mathuradas Mill Compound, Lower Parel, Mumbai 400013",
    latitude: 18.998,
    longitude: 72.831,
    description:
      "Industrial-chic cafe in a converted mill compound. Soaring ceilings, exposed ducting, and a buzzy atmosphere. The back courtyard is quieter and great for afternoon meetings.",
    noiseLevel: "moderate",
    pricePerHour: 50000,
    avgRating: 4.4,
    totalReviews: 33,
  },
  {
    name: "The Pantry",
    area: "Lower Parel",
    address: "Palladium Mall, Lower Parel, Mumbai 400013",
    latitude: 18.997,
    longitude: 72.83,
    description:
      "European-style patisserie with a clean, minimalist interior. Quiet enough for serious discussions, with excellent pastries to sweeten any deal. The corner booth is the most private spot.",
    noiseLevel: "quiet",
    pricePerHour: 55000,
    avgRating: 4.5,
    totalReviews: 21,
  },
  {
    name: "Toit Taproom",
    area: "Lower Parel",
    address: "Raghuvanshi Mills, Lower Parel, Mumbai 400013",
    latitude: 18.999,
    longitude: 72.832,
    description:
      "Craft brewery with a vibrant daytime crowd. The mezzanine level overlooks the main floor and has dedicated WiFi. Best for casual team celebrations or Friday afternoon syncs.",
    noiseLevel: "lively",
    pricePerHour: 40000,
    avgRating: 4.2,
    totalReviews: 39,
  },
  {
    name: "Kala Ghoda Cafe LP",
    area: "Lower Parel",
    address: "Kamala Mills, Lower Parel, Mumbai 400013",
    latitude: 18.996,
    longitude: 72.829,
    description:
      "Art-inspired cafe with rotating gallery walls and a tranquil atmosphere. The reading corner has the best acoustics for private conversations. Known for their cold brew and banana bread.",
    noiseLevel: "quiet",
    pricePerHour: 45000,
    avgRating: 4.6,
    totalReviews: 16,
  },
  // ── Powai (4) ──
  {
    name: "Sequel Bistro",
    area: "Powai",
    address: "Hiranandani Business Park, Powai, Mumbai 400076",
    latitude: 19.1176,
    longitude: 72.906,
    description:
      "Lakeside bistro with panoramic views of Powai Lake. The glass-walled meeting room is bookable and comes with a whiteboard and screen. A favourite for east-Mumbai professionals.",
    noiseLevel: "quiet",
    pricePerHour: 40000,
    avgRating: 4.5,
    totalReviews: 24,
  },
  {
    name: "Cafe Coffee Day Powai",
    area: "Powai",
    address: "Hiranandani Gardens, Powai, Mumbai 400076",
    latitude: 19.119,
    longitude: 72.908,
    description:
      "Reliable CCD with a familiar setup. The upstairs lounge is less crowded and has decent WiFi. Budget-friendly option for quick catch-ups and casual 1:1 meetings.",
    noiseLevel: "moderate",
    pricePerHour: 25000,
    avgRating: 4.0,
    totalReviews: 31,
  },
  {
    name: "The Coppice",
    area: "Powai",
    address: "Central Avenue, Powai, Mumbai 400076",
    latitude: 19.12,
    longitude: 72.907,
    description:
      "Garden cafe surrounded by greenery — a rare find in Mumbai. The covered patio has natural ventilation and a surprisingly strong WiFi signal. Perfect for longer working sessions.",
    noiseLevel: "quiet",
    pricePerHour: 35000,
    avgRating: 4.4,
    totalReviews: 14,
  },
  {
    name: "IIT Bombay Cafe",
    area: "Powai",
    address: "Main Gate Road, near IIT Bombay, Powai, Mumbai 400076",
    latitude: 19.1334,
    longitude: 72.9133,
    description:
      "Campus-adjacent cafe popular with researchers and engineers. No-frills setup with rock-solid WiFi and the cheapest rates in Powai. The outdoor benches have a great campus view.",
    noiseLevel: "quiet",
    pricePerHour: 20000,
    avgRating: 4.1,
    totalReviews: 8,
  },
  // ── Juhu / Versova (2) ──
  {
    name: "Prithvi Cafe",
    area: "Juhu",
    address: "Prithvi Theatre, Juhu Church Road, Mumbai 400049",
    latitude: 19.099,
    longitude: 72.8268,
    description:
      "The legendary cafe outside Prithvi Theatre. An institution in Mumbai's cultural scene with affordable chai and an artistic atmosphere. The garden seating is magical for creative brainstorms.",
    noiseLevel: "quiet",
    pricePerHour: 35000,
    avgRating: 4.8,
    totalReviews: 37,
  },
  {
    name: "Deli 9",
    area: "Versova",
    address: "Seven Bungalows, Versova, Mumbai 400061",
    latitude: 19.131,
    longitude: 72.817,
    description:
      "Creative hub cafe frequented by Versova's film and advertising crowd. The interiors are eclectic and inspiring. Fast WiFi and generous table spacing make it ideal for working meetings.",
    noiseLevel: "moderate",
    pricePerHour: 40000,
    avgRating: 4.3,
    totalReviews: 25,
  },
  // ── Fort / Churchgate (2) ──
  {
    name: "Kala Ghoda Social",
    area: "Fort",
    address: "Kamal Mansion, Kala Ghoda, Fort, Mumbai 400001",
    latitude: 18.9322,
    longitude: 72.8312,
    description:
      "Heritage-building SOCIAL in the heart of Fort's art district. Soaring ceilings and vintage decor give meetings a gravitas that modern cafes can't match. The first floor is quieter.",
    noiseLevel: "lively",
    pricePerHour: 50000,
    avgRating: 4.3,
    totalReviews: 40,
  },
  {
    name: "Pantry d'Or",
    area: "Churchgate",
    address: "Veer Nariman Road, Churchgate, Mumbai 400020",
    latitude: 18.935,
    longitude: 72.827,
    description:
      "French-inspired patisserie near Churchgate station with marble counters and soft jazz. The private alcove seats 6 comfortably and is a favourite for investor-founder conversations.",
    noiseLevel: "quiet",
    pricePerHour: 60000,
    avgRating: 4.7,
    totalReviews: 11,
  },
]

// ─── Space templates ─────────────────────────────────────────────────────────

type SpaceTemplate = {
  name: string
  description: string
  capacityMin: number
  capacityMax: number
  noiseLevel: "quiet" | "moderate" | "lively"
  /** Price multiplier relative to the cafe's base price */
  priceMultiplier: number
  /** Probability (0-1) of this space being added to a cafe */
  probability: number
}

const SPACE_TEMPLATES: SpaceTemplate[] = [
  {
    name: "Corner Booth",
    description:
      "A cozy, semi-enclosed booth in a quiet corner. Great for 1:1 meetings and focused conversations with minimal distractions.",
    capacityMin: 2,
    capacityMax: 4,
    noiseLevel: "quiet",
    priceMultiplier: 1.0,
    probability: 0.95,
  },
  {
    name: "Open Table",
    description:
      "A spacious table in the main seating area. Good natural light and easy access to the counter for refills. Best for casual meetings.",
    capacityMin: 2,
    capacityMax: 6,
    noiseLevel: "moderate",
    priceMultiplier: 0.8,
    probability: 0.9,
  },
  {
    name: "Private Room",
    description:
      "An enclosed, soundproofed room with a door. Equipped with a whiteboard and screen hookup. Perfect for confidential discussions and video calls.",
    capacityMin: 4,
    capacityMax: 8,
    noiseLevel: "quiet",
    priceMultiplier: 1.5,
    probability: 0.55,
  },
  {
    name: "Rooftop Section",
    description:
      "Open-air seating on the terrace with city views. A refreshing change of scenery for brainstorms and creative sessions. Weather-dependent availability.",
    capacityMin: 4,
    capacityMax: 10,
    noiseLevel: "moderate",
    priceMultiplier: 1.2,
    probability: 0.3,
  },
  {
    name: "Lounge Area",
    description:
      "Comfortable sofas and low tables in a relaxed setting. Ideal for informal catch-ups, 1:1s, and interviews where a casual vibe puts people at ease.",
    capacityMin: 2,
    capacityMax: 5,
    noiseLevel: "moderate",
    priceMultiplier: 0.9,
    probability: 0.4,
  },
]

// ─── Seed functions ──────────────────────────────────────────────────────────

async function clearSeedData() {
  console.log("Clearing existing seed data...")

  // Find all cafes owned by the demo cafe owner
  const demoCafes = await db
    .select({ id: schema.cafes.id })
    .from(schema.cafes)
    .where(eq(schema.cafes.ownerId, "user_cafe_demo"))

  const cafeIds = demoCafes.map((c) => c.id)

  if (cafeIds.length > 0) {
    // Find all spaces in demo cafes
    const demoSpaces = await db
      .select({ id: schema.spaces.id })
      .from(schema.spaces)
      .where(inArray(schema.spaces.cafeId, cafeIds))

    const spaceIds = demoSpaces.map((s) => s.id)

    // Find all bookings for demo cafes
    const demoBookings = await db
      .select({ id: schema.bookings.id })
      .from(schema.bookings)
      .where(inArray(schema.bookings.cafeId, cafeIds))

    const bookingIds = demoBookings.map((b) => b.id)

    // Delete in FK-safe order
    if (bookingIds.length > 0) {
      await db
        .delete(schema.reviews)
        .where(inArray(schema.reviews.bookingId, bookingIds))
      await db
        .delete(schema.payments)
        .where(inArray(schema.payments.bookingId, bookingIds))
      await db
        .delete(schema.bookingInvites)
        .where(inArray(schema.bookingInvites.bookingId, bookingIds))
      await db
        .delete(schema.bookings)
        .where(inArray(schema.bookings.id, bookingIds))
    }

    if (spaceIds.length > 0) {
      await db
        .delete(schema.availability)
        .where(inArray(schema.availability.spaceId, spaceIds))
      await db
        .delete(schema.spaces)
        .where(inArray(schema.spaces.id, spaceIds))
    }

    await db
      .delete(schema.cafes)
      .where(inArray(schema.cafes.id, cafeIds))
  }

  // Delete notifications for demo users
  await db
    .delete(schema.notifications)
    .where(inArray(schema.notifications.userId, [...DEMO_USER_IDS]))

  // Delete demo users (also catches bookings by worker that weren't in demo cafes)
  const workerBookings = await db
    .select({ id: schema.bookings.id })
    .from(schema.bookings)
    .where(eq(schema.bookings.workerId, "user_worker_demo"))

  if (workerBookings.length > 0) {
    const wbIds = workerBookings.map((b) => b.id)
    await db
      .delete(schema.reviews)
      .where(inArray(schema.reviews.bookingId, wbIds))
    await db
      .delete(schema.payments)
      .where(inArray(schema.payments.bookingId, wbIds))
    await db
      .delete(schema.bookingInvites)
      .where(inArray(schema.bookingInvites.bookingId, wbIds))
    await db
      .delete(schema.bookings)
      .where(inArray(schema.bookings.id, wbIds))
  }

  await db
    .delete(schema.users)
    .where(inArray(schema.users.id, [...DEMO_USER_IDS]))

  console.log("  Cleared existing seed data \u2713")
}

async function seedUsers() {
  console.log("Seeding users...")

  await db.insert(schema.users).values([
    {
      id: "user_worker_demo",
      email: "priya@demo.perch.in",
      name: "Priya Sharma",
      role: "worker",
      companyName: "Acme Consulting",
    },
    {
      id: "user_cafe_demo",
      email: "ravi@demo.perch.in",
      name: "Ravi Patel",
      role: "cafe_owner",
      phone: "+919876543210",
    },
    {
      id: "user_admin_demo",
      email: "admin@demo.perch.in",
      name: "Perch Admin",
      role: "admin",
    },
  ])

  console.log("  3 users created \u2713")
}

async function seedCafes(): Promise<{ id: string; pricePerHour: number; name: string }[]> {
  console.log("Seeding cafes...")

  const insertedCafes: { id: string; pricePerHour: number; name: string }[] = []

  for (const cafe of CAFES) {
    const slug = generateSlug(cafe.name)

    const [inserted] = await db
      .insert(schema.cafes)
      .values({
        ownerId: "user_cafe_demo",
        name: cafe.name,
        slug,
        description: cafe.description,
        address: cafe.address,
        city: "Mumbai",
        latitude: cafe.latitude,
        longitude: cafe.longitude,
        verificationStatus: "verified",
        isActive: true,
        avgRating: cafe.avgRating,
        totalReviews: cafe.totalReviews,
      })
      .returning({ id: schema.cafes.id })

    insertedCafes.push({
      id: inserted.id,
      pricePerHour: cafe.pricePerHour,
      name: cafe.name,
    })
  }

  console.log(`  ${insertedCafes.length} cafes created \u2713`)
  return insertedCafes
}

type SpaceRecord = {
  id: string
  cafeId: string
  cafeName: string
  pricePerHour: number
}

async function seedSpaces(
  cafes: { id: string; pricePerHour: number; name: string }[]
): Promise<SpaceRecord[]> {
  console.log("Seeding spaces...")

  const allSpaces: SpaceRecord[] = []

  for (const cafe of cafes) {
    // Pick 2-3 spaces per cafe using probability
    const selectedTemplates = SPACE_TEMPLATES.filter(
      (t) => Math.random() < t.probability
    )

    // Ensure at least 2 spaces
    const templates =
      selectedTemplates.length >= 2
        ? selectedTemplates.slice(0, Math.min(selectedTemplates.length, 4))
        : SPACE_TEMPLATES.slice(0, 2)

    for (const template of templates) {
      const pricePerHour = Math.round(cafe.pricePerHour * template.priceMultiplier)
      const amenities = randomSubset([...AMENITIES_POOL], 3, 6)

      const [inserted] = await db
        .insert(schema.spaces)
        .values({
          cafeId: cafe.id,
          name: template.name,
          description: template.description,
          capacityMin: template.capacityMin,
          capacityMax: template.capacityMax,
          pricePerHour,
          amenities,
          noiseLevel: template.noiseLevel,
          photos: [],
          isActive: true,
        })
        .returning({ id: schema.spaces.id })

      allSpaces.push({
        id: inserted.id,
        cafeId: cafe.id,
        cafeName: cafe.name,
        pricePerHour,
      })
    }
  }

  console.log(`  ${allSpaces.length} spaces created \u2713`)
  return allSpaces
}

async function seedAvailability(spaces: SpaceRecord[]) {
  console.log("Seeding availability...")

  let count = 0

  for (const space of spaces) {
    // Monday (1) to Friday (5): 09:00 - 18:00
    for (let day = 1; day <= 5; day++) {
      await db.insert(schema.availability).values({
        spaceId: space.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isRecurring: true,
      })
      count++
    }

    // ~60% of spaces also available Saturday
    if (Math.random() < 0.6) {
      await db.insert(schema.availability).values({
        spaceId: space.id,
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "16:00",
        isRecurring: true,
      })
      count++
    }
  }

  console.log(`  ${count} availability slots created \u2713`)
}

type BookingRecord = {
  id: string
  status: string
  cafeId: string
  spaceId: string
}

async function seedBookings(
  spaces: SpaceRecord[]
): Promise<BookingRecord[]> {
  console.log("Seeding bookings...")

  const statuses: {
    status: "completed" | "confirmed" | "checked_in" | "cancelled" | "pending"
    count: number
  }[] = [
    { status: "completed", count: 15 },
    { status: "confirmed", count: 10 },
    { status: "checked_in", count: 5 },
    { status: "cancelled", count: 5 },
    { status: "pending", count: 5 },
  ]

  const allBookings: BookingRecord[] = []
  let bookingIndex = 0

  for (const { status, count } of statuses) {
    for (let i = 0; i < count; i++) {
      const space = spaces[bookingIndex % spaces.length]
      const time = randomFrom(BOOKING_TIMES)
      const meetingTitle = randomFrom(MEETING_TITLES)

      // Completed bookings: past 30 days; upcoming: next 14 days; checked_in: today
      let bookingDate: Date
      if (status === "completed" || status === "cancelled") {
        bookingDate = daysAgo(randomBetween(1, 30))
      } else if (status === "checked_in") {
        bookingDate = new Date()
      } else {
        bookingDate = daysFromNow(randomBetween(1, 14))
      }

      const { totalAmount, platformFee, cafePayout, gstAmount } =
        calculateBookingAmounts(space.pricePerHour, time.hours)

      const cancelledAt =
        status === "cancelled" ? daysAgo(randomBetween(0, 5)) : null
      const cancelReason =
        status === "cancelled" ? "Schedule conflict — had to reschedule" : null

      const orderId = `order_demo_${bookingIndex.toString().padStart(4, "0")}`
      const paymentId =
        status === "completed" || status === "checked_in"
          ? `pay_demo_${bookingIndex.toString().padStart(4, "0")}`
          : null

      const [inserted] = await db
        .insert(schema.bookings)
        .values({
          workerId: "user_worker_demo",
          spaceId: space.id,
          cafeId: space.cafeId,
          date: formatDate(bookingDate),
          startTime: time.start,
          endTime: time.end,
          durationHours: time.hours,
          numAttendees: randomBetween(1, 6),
          meetingTitle,
          status,
          totalAmount,
          platformFee,
          cafePayout,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          cancelledAt,
          cancelReason,
        })
        .returning({ id: schema.bookings.id })

      // Create matching payment record
      const paymentStatus =
        status === "completed" || status === "checked_in" || status === "confirmed"
          ? "captured"
          : status === "cancelled"
            ? "refunded"
            : "pending"

      const payoutStatus =
        status === "completed" ? "settled" : "pending"

      await db.insert(schema.payments).values({
        bookingId: inserted.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        amount: totalAmount,
        platformFee,
        cafeAmount: cafePayout,
        gstAmount,
        paymentStatus,
        payoutStatus,
        settledAt: status === "completed" ? daysAgo(randomBetween(0, 3)) : null,
      })

      allBookings.push({
        id: inserted.id,
        status,
        cafeId: space.cafeId,
        spaceId: space.id,
      })

      bookingIndex++
    }
  }

  console.log(`  ${allBookings.length} bookings + payments created \u2713`)
  return allBookings
}

async function seedReviews(bookings: BookingRecord[]) {
  console.log("Seeding reviews...")

  const completedBookings = bookings.filter((b) => b.status === "completed")
  const reviewCount = Math.min(20, completedBookings.length)

  for (let i = 0; i < reviewCount; i++) {
    const booking = completedBookings[i]
    const overall = randomFrom([3, 4, 4, 4, 5, 5, 5, 4, 5, 4])
    const comment = REVIEW_COMMENTS[i % REVIEW_COMMENTS.length]
    const cafeResponse = randomFrom(CAFE_RESPONSES)

    await db.insert(schema.reviews).values({
      bookingId: booking.id,
      workerId: "user_worker_demo",
      cafeId: booking.cafeId,
      overallRating: overall,
      wifiRating: randomBetween(3, 5),
      noiseRating: randomBetween(3, 5),
      spaceRating: randomBetween(3, 5),
      staffRating: randomBetween(4, 5),
      comment,
      cafeResponse,
      isVisible: true,
      createdAt: daysAgo(randomBetween(0, 25)),
    })
  }

  console.log(`  ${reviewCount} reviews created \u2713`)
}

async function seedNotifications() {
  console.log("Seeding notifications...")

  const notifs: schema.NewNotification[] = [
    {
      userId: "user_worker_demo",
      type: "booking_confirmed",
      title: "Booking Confirmed",
      content:
        "Your booking at The Brew Studio on March 25 is confirmed. See you at 10 AM!",
      isRead: true,
      createdAt: daysAgo(5),
    },
    {
      userId: "user_worker_demo",
      type: "booking_confirmed",
      title: "Booking Confirmed",
      content:
        "Your booking at SOCIAL BKC on March 28 is confirmed. Private Room, 2 PM.",
      isRead: true,
      createdAt: daysAgo(3),
    },
    {
      userId: "user_worker_demo",
      type: "reminder",
      title: "Upcoming Meeting Tomorrow",
      content:
        "Reminder: You have a booking at Subko Coffee tomorrow at 11 AM. Don't forget!",
      isRead: true,
      createdAt: daysAgo(2),
    },
    {
      userId: "user_worker_demo",
      type: "review_received",
      title: "Thanks for Your Review!",
      content:
        "The Brew Studio appreciated your 5-star review. Keep exploring great spaces!",
      isRead: true,
      createdAt: daysAgo(2),
    },
    {
      userId: "user_worker_demo",
      type: "booking_confirmed",
      title: "Booking Confirmed",
      content:
        "Your booking at Koffee Kulture for March 30 is confirmed. Corner Booth, 3 PM.",
      isRead: false,
      createdAt: daysAgo(1),
    },
    {
      userId: "user_worker_demo",
      type: "reminder",
      title: "Meeting in 2 Hours",
      content:
        "Heads up: Your meeting at Blue Tokai Coffee starts at 2 PM today. Safe travels!",
      isRead: false,
      createdAt: new Date(),
    },
    {
      userId: "user_worker_demo",
      type: "booking_confirmed",
      title: "Booking Confirmed",
      content:
        "Your booking at The Table BKC on April 2 is confirmed. Lounge Area, 10 AM.",
      isRead: false,
      createdAt: new Date(),
    },
    {
      userId: "user_cafe_demo",
      type: "booking_confirmed",
      title: "New Booking Received",
      content:
        "Priya Sharma booked the Corner Booth at The Brew Studio for March 25, 10 AM.",
      isRead: true,
      createdAt: daysAgo(5),
    },
    {
      userId: "user_cafe_demo",
      type: "review_received",
      title: "New Review Posted",
      content:
        'Priya Sharma left a 5-star review: "Great WiFi and quiet corner. Perfect for our client call."',
      isRead: false,
      createdAt: daysAgo(2),
    },
    {
      userId: "user_cafe_demo",
      type: "booking_confirmed",
      title: "New Booking Received",
      content:
        "Priya Sharma booked the Private Room at SOCIAL BKC for March 28, 2 PM.",
      isRead: false,
      createdAt: daysAgo(1),
    },
  ]

  for (const notif of notifs) {
    await db.insert(schema.notifications).values(notif)
  }

  console.log(`  ${notifs.length} notifications created \u2713`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n\u2615 Perch Database Seed Script\n")
  console.log("=".repeat(50))

  try {
    await clearSeedData()
    await seedUsers()
    const cafes = await seedCafes()
    const spaces = await seedSpaces(cafes)
    await seedAvailability(spaces)
    const bookings = await seedBookings(spaces)
    await seedReviews(bookings)
    await seedNotifications()

    console.log("\n" + "=".repeat(50))
    console.log("\u2705 Seed complete!")
    console.log(`   \u2022 3 users`)
    console.log(`   \u2022 ${cafes.length} cafes`)
    console.log(`   \u2022 ${spaces.length} spaces`)
    console.log(`   \u2022 40 bookings + payments`)
    console.log(`   \u2022 20 reviews`)
    console.log(`   \u2022 10 notifications`)
    console.log("")
  } catch (error) {
    console.error("\n\u274C Seed failed:", error)
    process.exit(1)
  }
}

seed()
