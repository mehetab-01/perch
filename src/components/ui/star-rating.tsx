"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type StarRatingProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizeConfig = {
  sm: { star: "size-5", gap: "gap-0.5" },
  md: { star: "size-7", gap: "gap-1" },
  lg: { star: "size-9", gap: "gap-1.5" },
}

function StarRatingInput({
  value,
  onChange,
  disabled = false,
  size = "md",
  label,
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0)
  const config = sizeConfig[size]
  const displayValue = hoveredStar || value

  const handleSelect = useCallback(
    (star: number) => {
      if (!disabled) onChange(star)
    },
    [disabled, onChange]
  )

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      )}
      <div
        className={cn("inline-flex items-center", config.gap)}
        role="radiogroup"
        aria-label={label ?? "Rating"}
        onMouseLeave={() => setHoveredStar(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue
          const isSelected = star === value

          return (
            <motion.button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(star)}
              onMouseEnter={() => !disabled && setHoveredStar(star)}
              whileHover={disabled ? undefined : { scale: 1.2 }}
              whileTap={disabled ? undefined : { scale: 0.85 }}
              animate={
                isSelected && value > 0
                  ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                  : { scale: 1 }
              }
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 400,
              }}
              className={cn(
                "cursor-pointer rounded-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-perch-primary-400",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              role="radio"
              aria-checked={star === value}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  config.star,
                  "transition-colors duration-150",
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-neutral-300 dark:text-neutral-600"
                )}
              />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export { StarRatingInput }
export type { StarRatingProps }
