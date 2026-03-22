import { type NextRequest, NextResponse } from "next/server"
import { sql, and, eq, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces } from "@/lib/db/schema"
import {
  searchParamsSchema,
  parseAmenities,
  type SearchParams,
} from "@/lib/validators/search"
import { parseSearchQuery } from "@/lib/ai/parse-search-query"

// ── Rate limiter (in-memory, per-IP, 10 AI searches/hour) ─────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const AI_RATE_LIMIT = 10
const AI_RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + AI_RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= AI_RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

// ── Haversine distance ─────────────────────────────────────────────────────
function haversineSQL(lat: number, lng: number) {
  return sql<number>`(
    6371 * acos(LEAST(1.0,
      cos(radians(${lat}))
      * cos(radians(${cafes.latitude}))
      * cos(radians(${cafes.longitude}) - radians(${lng}))
      + sin(radians(${lat}))
      * sin(radians(${cafes.latitude}))
    ))
  )`
}

// ── Shared search logic ────────────────────────────────────────────────────
async function executeSearch(params: SearchParams) {
  const amenityList = parseAmenities(params.amenities)
  const offset = (params.page - 1) * params.limit

  const conditions = [
    eq(cafes.isActive, true),
    eq(cafes.verificationStatus, "verified"),
    eq(spaces.isActive, true),
  ]

  if (params.city) {
    conditions.push(sql`lower(${cafes.city}) = lower(${params.city})`)
  }

  if (params.people) {
    conditions.push(gte(spaces.capacityMax, params.people))
    conditions.push(lte(spaces.capacityMin, params.people))
  }

  if (params.minPrice !== undefined) {
    conditions.push(gte(spaces.pricePerHour, params.minPrice * 100))
  }

  if (params.maxPrice !== undefined) {
    conditions.push(lte(spaces.pricePerHour, params.maxPrice * 100))
  }

  if (params.noiseLevel) {
    conditions.push(eq(spaces.noiseLevel, params.noiseLevel))
  }

  if (params.minRating) {
    conditions.push(gte(cafes.avgRating, params.minRating))
  }

  if (amenityList.length > 0) {
    conditions.push(sql`${spaces.amenities}::jsonb @> ${sql`${JSON.stringify(amenityList)}`}::jsonb`)
  }

  const hasLocation = params.lat !== undefined && params.lng !== undefined
  if (hasLocation) {
    const distExpr = haversineSQL(params.lat!, params.lng!)
    conditions.push(sql`${distExpr} < 50`)
  }

  let orderExpr
  switch (params.sortBy) {
    case "price_asc":
      orderExpr = sql`${spaces.pricePerHour} ASC`
      break
    case "price_desc":
      orderExpr = sql`${spaces.pricePerHour} DESC`
      break
    case "distance":
      orderExpr =
        hasLocation
          ? sql`${haversineSQL(params.lat!, params.lng!)} ASC`
          : sql`${cafes.avgRating} DESC`
      break
    case "rating":
    default:
      orderExpr = sql`${cafes.avgRating} DESC`
      break
  }

  const results = await db
    .select({
      cafeId: cafes.id,
      cafeName: cafes.name,
      cafeSlug: cafes.slug,
      cafeDescription: cafes.description,
      address: cafes.address,
      city: cafes.city,
      latitude: cafes.latitude,
      longitude: cafes.longitude,
      avgRating: cafes.avgRating,
      totalReviews: cafes.totalReviews,
      spaceId: spaces.id,
      spaceName: spaces.name,
      spaceDescription: spaces.description,
      capacityMin: spaces.capacityMin,
      capacityMax: spaces.capacityMax,
      pricePerHour: spaces.pricePerHour,
      amenities: spaces.amenities,
      noiseLevel: spaces.noiseLevel,
      photos: spaces.photos,
      ...(hasLocation
        ? { distance: haversineSQL(params.lat!, params.lng!) }
        : {}),
    })
    .from(cafes)
    .innerJoin(spaces, eq(spaces.cafeId, cafes.id))
    .where(and(...conditions))
    .orderBy(orderExpr)
    .limit(params.limit)
    .offset(offset)

  // Group spaces by cafe
  const cafeMap = new Map<
    string,
    {
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
      spaces: Array<{
        id: string
        name: string
        description: string | null
        capacityMin: number
        capacityMax: number
        pricePerHour: number
        amenities: string[]
        noiseLevel: string
        photos: string[]
      }>
      cheapestPrice: number
    }
  >()

  for (const row of results) {
    const existing = cafeMap.get(row.cafeId)
    const space = {
      id: row.spaceId,
      name: row.spaceName,
      description: row.spaceDescription,
      capacityMin: row.capacityMin,
      capacityMax: row.capacityMax,
      pricePerHour: row.pricePerHour,
      amenities: row.amenities,
      noiseLevel: row.noiseLevel,
      photos: row.photos,
    }

    if (existing) {
      existing.spaces.push(space)
      if (row.pricePerHour < existing.cheapestPrice) {
        existing.cheapestPrice = row.pricePerHour
      }
    } else {
      cafeMap.set(row.cafeId, {
        id: row.cafeId,
        name: row.cafeName,
        slug: row.cafeSlug,
        description: row.cafeDescription,
        address: row.address,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
        avgRating: row.avgRating,
        totalReviews: row.totalReviews,
        distance: "distance" in row ? (row.distance as number) : null,
        spaces: [space],
        cheapestPrice: row.pricePerHour,
      })
    }
  }

  const data = Array.from(cafeMap.values())

  const countResult = await db
    .select({ count: sql<number>`count(DISTINCT ${cafes.id})` })
    .from(cafes)
    .innerJoin(spaces, eq(spaces.cafeId, cafes.id))
    .where(and(...conditions))

  const totalCafes = Number(countResult[0]?.count ?? 0)

  return {
    cafes: data,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalCafes,
      totalPages: Math.ceil(totalCafes / params.limit),
    },
  }
}

// ── GET: traditional search with URL params ────────────────────────────────
async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const rawParams = Object.fromEntries(url.searchParams.entries())

  const parsed = searchParamsSchema.safeParse(rawParams)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const result = await executeSearch(parsed.data)
  return NextResponse.json(result)
}

// ── POST: AI-powered natural language search ───────────────────────────────
async function POST(req: NextRequest) {
  const body = await req.json() as { naturalQuery?: string; [key: string]: unknown }
  const { naturalQuery, ...explicitFilters } = body

  if (!naturalQuery || typeof naturalQuery !== "string") {
    return NextResponse.json(
      { error: "naturalQuery is required" },
      { status: 400 }
    )
  }

  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "AI search rate limit exceeded. Try again later." },
      { status: 429 }
    )
  }

  // Parse natural language query with Claude
  const aiFilters = await parseSearchQuery(naturalQuery)

  // Build search params: AI-extracted filters, overridden by explicit filters
  const mergedParams: Record<string, unknown> = {}

  if (aiFilters) {
    // Map AI filters to search params format
    if (aiFilters.city) mergedParams.city = aiFilters.city
    if (aiFilters.area) mergedParams.city = aiFilters.area // area maps to city search
    if (aiFilters.date) mergedParams.date = aiFilters.date
    if (aiFilters.startTime) mergedParams.startTime = aiFilters.startTime
    if (aiFilters.duration) mergedParams.duration = aiFilters.duration
    if (aiFilters.people) mergedParams.people = aiFilters.people
    if (aiFilters.amenities && aiFilters.amenities.length > 0) {
      mergedParams.amenities = aiFilters.amenities.join(",")
    }
    if (aiFilters.noiseLevel) mergedParams.noiseLevel = aiFilters.noiseLevel
    if (aiFilters.maxPricePerHour) mergedParams.maxPrice = aiFilters.maxPricePerHour
    if (aiFilters.sortBy) mergedParams.sortBy = aiFilters.sortBy
  }

  // Explicit filters override AI-extracted ones
  for (const [key, value] of Object.entries(explicitFilters)) {
    if (value !== undefined && value !== null && value !== "") {
      mergedParams[key] = value
    }
  }

  const parsed = searchParamsSchema.safeParse(mergedParams)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const result = await executeSearch(parsed.data)

  return NextResponse.json({
    ...result,
    aiFilters: aiFilters ?? null,
  })
}

export { GET, POST }
