"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils/cn"

/* ── Card ── */

type CardProps = HTMLMotionProps<"div"> & {
  glass?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
        transition={{ duration: 0.2 }}
        className={cn(
          "rounded-xl border border-border bg-white text-foreground shadow-sm transition-colors",
          "dark:bg-perch-dark/80 dark:border-stone-800",
          glass &&
            "bg-white/60 backdrop-blur-xl dark:bg-stone-900/60",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

/* ── CardHeader ── */

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

/* ── CardContent ── */

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-6 pb-6", className)} {...props} />
  )
}

/* ── CardFooter ── */

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center px-6 pb-6 pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardContent, CardFooter }
export type { CardProps }
