"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Save,
  Loader2,
  AlertTriangle,
  Building2,
  FileText,
  CreditCard,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import type { Cafe } from "@/lib/db/schema"

type SettingsProps = {
  cafe: Cafe
}

function CafeSettingsClient({ cafe }: SettingsProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState(cafe.name)
  const [description, setDescription] = useState(cafe.description ?? "")
  const [address, setAddress] = useState(cafe.address)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

  const handleSave = useCallback(async () => {
    if (!name.trim() || !address.trim()) {
      toast("Name and address are required", "error")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/cafes/${cafe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          address: address.trim(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Failed to save")
      }

      toast("Settings saved", "success")
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error")
    } finally {
      setIsSaving(false)
    }
  }, [cafe.id, name, description, address, toast, router])

  const handleDeactivate = useCallback(async () => {
    setIsDeactivating(true)
    try {
      const res = await fetch(`/api/cafes/${cafe.id}/deactivate`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to update")

      const { isActive } = (await res.json()) as { isActive: boolean }
      toast(
        isActive
          ? "Cafe reactivated! You're now visible to workers."
          : "Cafe deactivated. You will no longer appear in search results.",
        isActive ? "success" : "warning"
      )
      setShowDeactivateConfirm(false)
      router.refresh()
    } catch {
      toast("Failed to update cafe status", "error")
    } finally {
      setIsDeactivating(false)
    }
  }, [cafe.id, toast, router])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Cafe Details */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="size-5 text-perch-primary-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Cafe details
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="cafe-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Cafe name
            </label>
            <Input
              id="cafe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div>
            <label
              htmlFor="cafe-description"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="cafe-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
              maxLength={500}
              className={cn(
                "w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-shadow",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-stone-700"
              )}
            />
            <p className="mt-1 text-xs text-neutral-400">
              {description.length}/500
            </p>
          </div>

          <div>
            <label
              htmlFor="cafe-address"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Address
            </label>
            <Input
              id="cafe-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save changes
          </Button>
        </div>
      </Card>

      {/* Verification Documents */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="size-5 text-perch-primary-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Verification documents
          </h2>
        </div>

        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
            <span>GST Number</span>
            <span className="font-mono text-foreground">
              {cafe.gstNumber ?? "Not provided"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
            <span>FSSAI License</span>
            <span className="text-foreground">
              {cafe.fssaiLicenseUrl ? "Uploaded" : "Not provided"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-stone-800">
            <span>Verification status</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                cafe.verificationStatus === "verified"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : cafe.verificationStatus === "rejected"
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              )}
            >
              {cafe.verificationStatus}
            </span>
          </div>
          {cafe.verificationStatus === "rejected" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Your verification was rejected. Please update your documents and
              re-submit from the onboarding flow.
            </p>
          )}
        </div>
      </Card>

      {/* Bank Account */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="size-5 text-perch-primary-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Bank account
          </h2>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Bank account details are managed by our payments partner. To update
          your bank account, please contact support at{" "}
          <a
            href="mailto:support@perch.co.in"
            className="font-medium text-perch-primary-600 hover:underline dark:text-perch-primary-400"
          >
            support@perch.co.in
          </a>
        </p>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 p-6 dark:border-red-900/50">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="size-5 text-red-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Danger zone
          </h2>
        </div>

        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {cafe.isActive
            ? "Deactivating your cafe will hide it from search results. Existing bookings will not be affected. You can reactivate at any time."
            : "Your cafe is currently deactivated and hidden from search results. Reactivate to start receiving bookings again."}
        </p>

        {showDeactivateConfirm ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <AlertTriangle className="size-5 shrink-0 text-red-500" />
            <p className="flex-1 text-sm text-red-700 dark:text-red-300">
              {cafe.isActive
                ? "Are you sure? Your cafe will be hidden from all search results."
                : "Reactivate your cafe?"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateConfirm(false)}
                disabled={isDeactivating}
              >
                Cancel
              </Button>
              <Button
                variant={cafe.isActive ? "destructive" : "secondary"}
                size="sm"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : cafe.isActive ? (
                  "Deactivate"
                ) : (
                  "Reactivate"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant={cafe.isActive ? "destructive" : "secondary"}
            onClick={() => setShowDeactivateConfirm(true)}
          >
            {cafe.isActive ? "Deactivate cafe" : "Reactivate cafe"}
          </Button>
        )}
      </Card>
    </div>
  )
}

export { CafeSettingsClient }
