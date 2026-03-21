"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cafeDocumentsSchema, type CafeDocumentsInput } from "@/lib/validators/cafe"
import { UploadButton } from "@/lib/uploadthing"
import type { OnboardingState } from "@/components/onboarding/types"

type StepDocumentsProps = {
  state: OnboardingState
  onNext: (data: Partial<OnboardingState>) => void
  onBack: () => void
}

function StepDocuments({ state, onNext, onBack }: StepDocumentsProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CafeDocumentsInput>({
    resolver: zodResolver(cafeDocumentsSchema),
    defaultValues: {
      gstNumber: state.gstNumber ?? "",
      fssaiLicenseNumber: state.fssaiLicenseNumber ?? "",
      fssaiLicenseUrl: state.fssaiLicenseUrl ?? "",
    },
  })

  const fssaiLicenseUrl = watch("fssaiLicenseUrl")

  const onSubmit = async (data: CafeDocumentsInput) => {
    if (!state.cafeId) return

    const res = await fetch(`/api/cafes/${state.cafeId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? "Failed to save documents")
      return
    }

    onNext({
      gstNumber: data.gstNumber ?? "",
      fssaiLicenseNumber: data.fssaiLicenseNumber ?? "",
      fssaiLicenseUrl: data.fssaiLicenseUrl ?? "",
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Privacy notice */}
      <div className="flex items-start gap-3 rounded-lg border border-perch-secondary-200 bg-perch-secondary-50/50 p-4 dark:border-perch-secondary-800 dark:bg-perch-secondary-950/20">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-perch-secondary-600 dark:text-perch-secondary-400" />
        <p className="text-sm text-perch-secondary-700 dark:text-perch-secondary-300">
          Your documents are encrypted and only used for verification. They are deleted after
          approval, per the DPDP Act.
        </p>
      </div>

      <div>
        <label htmlFor="gst-number" className="mb-1.5 block text-sm font-medium text-foreground">
          GST Number
        </label>
        <Input
          id="gst-number"
          placeholder="22AAAAA0000A1Z5"
          error={!!errors.gstNumber}
          {...register("gstNumber")}
        />
        {errors.gstNumber && (
          <p className="mt-1 text-xs text-destructive">{errors.gstNumber.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          15-character alphanumeric format. Optional if not GST-registered.
        </p>
      </div>

      <div>
        <label htmlFor="fssai-number" className="mb-1.5 block text-sm font-medium text-foreground">
          FSSAI License Number
        </label>
        <Input
          id="fssai-number"
          placeholder="14-digit number"
          error={!!errors.fssaiLicenseNumber}
          {...register("fssaiLicenseNumber")}
        />
        {errors.fssaiLicenseNumber && (
          <p className="mt-1 text-xs text-destructive">{errors.fssaiLicenseNumber.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          <FileText className="mr-1.5 inline size-4 text-muted-foreground" />
          FSSAI License document
        </label>
        {fssaiLicenseUrl ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <span className="truncate text-sm text-foreground">Document uploaded</span>
            <button
              type="button"
              onClick={() => setValue("fssaiLicenseUrl", "")}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <UploadButton
            endpoint="verificationDocument"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                setValue("fssaiLicenseUrl", res[0].ufsUrl)
              }
            }}
            onUploadError={(err) => {
              alert(`Upload failed: ${err.message}`)
            }}
          />
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          PDF or image. Max 8MB.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save & continue"}
        </Button>
      </div>
    </form>
  )
}

export { StepDocuments }
