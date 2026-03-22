"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Store, FileCheck, Layers, Calendar, ClipboardCheck } from "lucide-react"
import { Container } from "@/components/ui/container"
import { cn } from "@/lib/utils/cn"
import { StepCafeDetails } from "@/components/onboarding/step-cafe-details"
import { StepDocuments } from "@/components/onboarding/step-documents"
import { StepAddSpaces } from "@/components/onboarding/step-add-spaces"
import { StepAvailability } from "@/components/onboarding/step-availability"
import { StepReview } from "@/components/onboarding/step-review"
import {
  type OnboardingState,
  initialOnboardingState,
} from "@/components/onboarding/types"

const STEPS = [
  { label: "Cafe Details", icon: Store },
  { label: "Documents", icon: FileCheck },
  { label: "Add Spaces", icon: Layers },
  { label: "Availability", icon: Calendar },
  { label: "Review", icon: ClipboardCheck },
]

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [state, setState] = useState<OnboardingState>(initialOnboardingState)

  const goToStep = useCallback(
    (step: number) => {
      setDirection(step > currentStep ? 1 : -1)
      setCurrentStep(step)
    },
    [currentStep]
  )

  const handleNext = useCallback(
    (data: Partial<OnboardingState>) => {
      setState((prev) => ({ ...prev, ...data }))
      setDirection(1)
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
    },
    []
  )

  const handleBack = useCallback(() => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <main className="min-h-screen bg-perch-light py-8 dark:bg-stone-950">
      <Container className="max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            List your cafe on Perch
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get your space in front of thousands of professionals looking for meeting spots.
          </p>
        </div>

        {/* Progress indicator */}
        <nav aria-label="Onboarding progress" className="mb-8">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const isActive = i === currentStep
              const isComplete = i < currentStep
              return (
                <li key={step.label} className="flex flex-1 items-center">
                  <button
                    onClick={() => {
                      // Only allow navigating to completed steps
                      if (i < currentStep) goToStep(i)
                    }}
                    disabled={i > currentStep}
                    className={cn(
                      "flex flex-col items-center gap-1.5 text-center",
                      i <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                    )}
                    aria-label={`Step ${i + 1}: ${step.label}${isComplete ? " (completed)" : isActive ? " (current)" : ""}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                        isComplete
                          ? "border-perch-secondary-500 bg-perch-secondary-500 text-white"
                          : isActive
                            ? "border-perch-primary-500 bg-perch-primary-50 text-perch-primary-600 dark:bg-perch-primary-950/30 dark:text-perch-primary-400"
                            : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span
                      className={cn(
                        "hidden text-xs font-medium sm:block",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="mx-2 h-0.5 flex-1">
                      <div
                        className={cn(
                          "h-full rounded-full transition-colors",
                          i < currentStep ? "bg-perch-secondary-500" : "bg-border"
                        )}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {currentStep === 0 && (
                <StepCafeDetails state={state} onNext={handleNext} />
              )}
              {currentStep === 1 && (
                <StepDocuments state={state} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 2 && (
                <StepAddSpaces state={state} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 3 && (
                <StepAvailability state={state} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 4 && (
                <StepReview state={state} onGoToStep={goToStep} onBack={handleBack} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step counter (mobile) */}
        <p className="mt-6 text-center text-xs text-muted-foreground sm:hidden">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </Container>
    </main>
  )
}

export { OnboardingPage as default }
