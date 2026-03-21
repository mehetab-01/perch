export type OnboardingSpace = {
  id?: string
  name: string
  description?: string
  capacityMin: number
  capacityMax: number
  pricePerHour: number // in ₹ (converted to paise on save)
  noiseLevel: "quiet" | "moderate" | "lively"
  amenities: string[]
  photos: string[]
}

export type AvailabilitySlot = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type SpaceAvailability = {
  spaceId: string
  spaceName: string
  slots: AvailabilitySlot[]
}

export type OnboardingState = {
  cafeId: string | null
  slug: string | null
  // Step 1
  name: string
  description: string
  address: string
  city: string
  latitude: number
  longitude: number
  coverPhotoUrl: string
  // Step 2
  gstNumber: string
  fssaiLicenseNumber: string
  fssaiLicenseUrl: string
  // Step 3
  spaces: OnboardingSpace[]
  // Step 4
  availability: SpaceAvailability[]
}

export const initialOnboardingState: OnboardingState = {
  cafeId: null,
  slug: null,
  name: "",
  description: "",
  address: "",
  city: "Mumbai",
  latitude: 19.076,
  longitude: 72.8777,
  coverPhotoUrl: "",
  gstNumber: "",
  fssaiLicenseNumber: "",
  fssaiLicenseUrl: "",
  spaces: [],
  availability: [],
}
