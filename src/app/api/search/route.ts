import { type NextRequest, NextResponse } from "next/server"
import { sql, and, eq, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { cafes, spaces } from "@/lib/db/schema"
import {
  searchParamsSchema,
  parseAmenities,
} from "@/lib/validators/search"

// Haversine distance in km as a raw SQL fragment
// Uses LEAST(1, ...) to clamp acos input and avoid NaN from floating-point rounding
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const rawParams = Object.fromEntries(url.searchParams.entries())

  const parsed = searchParamsSchema.safeParse(rawParams)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const params = parsed.data
  const amenityList = parseAmenities(params.amenities)
  const offset = (params.page - 1) * params.limit

  // Build WHERE conditions
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
    // Convert rupees to paise for comparison
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
    // Check that the space's amenities jsonb array contains all requested amenities
    // The parameter is passed as a bound value, not interpolated
    conditions.push(sql`${spaces.amenities}::jsonb @> ${sql`${JSON.stringify(amenityList)}`}::jsonb`)
  }

  // If lat/lng, filter within ~50km radius
  const hasLocation = params.lat !== undefined && params.lng !== undefined
  if (hasLocation) {
    const distExpr = haversineSQL(params.lat!, params.lng!)
    conditions.push(sql`${distExpr} < 50`)
  }

  // Build ORDER BY
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

  // Execute query — join cafes + spaces, group by cafe
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
        ? {
            distance: haversineSQL(params.lat!, params.lng!),
          }
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

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(DISTINCT ${cafes.id})` })
    .from(cafes)
    .innerJoin(spaces, eq(spaces.cafeId, cafes.id))
    .where(and(...conditions))

  const totalCafes = Number(countResult[0]?.count ?? 0)

  return NextResponse.json({
    cafes: data,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalCafes,
      totalPages: Math.ceil(totalCafes / params.limit),
    },
  })
}
