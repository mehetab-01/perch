"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { cafeDetailsSchema, type CafeDetailsInput } from "@/lib/validators/cafe"
import { UploadButton } from "@/lib/uploadthing"
import type { OnboardingState } from "@/components/onboarding/types"

type StepCafeDetailsProps = {
  state: OnboardingState
  onNext: (data: Partial<OnboardingState>) => void
}

function StepCafeDetails({ state, onNext }: StepCafeDetailsProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CafeDetailsInput>({
    resolver: zodResolver(cafeDetailsSchema),
    defaultValues: {
      name: state.name ?? "",
      description: state.description ?? "",
      address: state.address ?? "",
      city: state.city ?? "Mumbai",
      latitude: state.latitude ?? 19.076,
      longitude: state.longitude ?? 72.8777,
      coverPhotoUrl: state.coverPhotoUrl ?? "",
    },
  })

  const description = watch("description") ?? ""
  const coverPhotoUrl = watch("coverPhotoUrl")

  const handleGeolocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude)
        setValue("longitude", pos.coords.longitude)
      },
      () => {
        // Silently fail — user can enter manually
      }
    )
  }

  const onSubmit = async (data: CafeDetailsInput) => {
    // Save to API
    const method = state.cafeId ? "PATCH" : "POST"
    const url = state.cafeId ? `/api/cafes/${state.cafeId}` : "/api/cafes"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? "Failed to save cafe details")
      return
    }

    const result = await res.json()
    onNext({
      cafeId: result.cafe.id,
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      coverPhotoUrl: data.coverPhotoUrl,
      slug: result.cafe.slug,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="cafe-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Cafe name *
        </label>
        <Input
          id="cafe-name"
          placeholder="e.g., The Third Wave"
          error={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="cafe-desc" className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="cafe-desc"
          rows={3}
          maxLength={500}
          placeholder="Tell professionals what makes your cafe great for meetings..."
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-shadow resize-none",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            errors.description && "border-destructive focus:ring-destructive"
          )}
          {...register("description")}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {description.length}/500
        </p>
      </div>

      <div>
        <label htmlFor="cafe-address" className="mb-1.5 block text-sm font-medium text-foreground">
          Full address *
        </label>
        <Input
          id="cafe-address"
          placeholder="123, ABC Road, Bandra West, Mumbai 400050"
          iconLeft={<MapPin />}
          error={!!errors.address}
          {...register("address")}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="cafe-city" className="mb-1.5 block text-sm font-medium text-foreground">
          City *
        </label>
        <select
          id="cafe-city"
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          {...register("city")}
        >
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Location coordinates
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGeolocation}
            className="gap-1 text-xs"
          >
            <Navigation className="size-3" />
            Use my location
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              placeholder="Latitude"
              type="number"
              step="any"
              error={!!errors.latitude}
              {...register("latitude", { valueAsNumber: true })}
              aria-label="Latitude"
            />
            {errors.latitude && (
              <p className="mt-1 text-xs text-destructive">{errors.latitude.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Longitude"
              type="number"
              step="any"
              error={!!errors.longitude}
              {...register("longitude", { valueAsNumber: true })}
              aria-label="Longitude"
            />
            {errors.longitude && (
              <p className="mt-1 text-xs text-destructive">{errors.longitude.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cover photo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Cover photo
        </label>
        {coverPhotoUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img src={coverPhotoUrl} alt="Cafe cover photo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setValue("coverPhotoUrl", "")}
              className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
            >
              Remove
            </button>
          </div>
        ) : (
          <UploadButton
            endpoint="cafePhoto"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                setValue("coverPhotoUrl", res[0].ufsUrl)
              }
            }}
            onUploadError={(err) => {
              alert(`Upload failed: ${err.message}`)
            }}
          />
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save & continue"}
      </Button>
    </form>
  )
}

export { StepCafeDetails }
