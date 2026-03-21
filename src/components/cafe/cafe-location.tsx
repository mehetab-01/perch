import { MapPin, Navigation } from "lucide-react"

type CafeLocationProps = {
  address: string
  city: string
  latitude: number
  longitude: number
}

function CafeLocation({ address, city, latitude, longitude }: CafeLocationProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <section aria-label="Location">
      <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
        Location
      </h2>

      <div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-perch-dark/80 dark:border-stone-800">
        {/* Map placeholder */}
        <div className="relative aspect-[16/9] bg-stone-100 dark:bg-stone-800">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="size-8" />
            <p className="text-sm">{city}</p>
          </div>
        </div>

        {/* Address info */}
        <div className="p-4">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            {address}
          </p>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-perch-primary-600 hover:text-perch-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded dark:text-perch-primary-400 dark:hover:text-perch-primary-300 transition-colors"
          >
            <Navigation className="size-4" />
            Get directions
          </a>
        </div>
      </div>
    </section>
  )
}

export { CafeLocation }
export type { CafeLocationProps }
