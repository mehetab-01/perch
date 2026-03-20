import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-perch-primary-100 text-perch-primary-800 dark:bg-perch-primary-950 dark:text-perch-primary-300",
        secondary:
          "bg-perch-secondary-100 text-perch-secondary-800 dark:bg-perch-secondary-950 dark:text-perch-secondary-300",
        outline:
          "border border-border text-foreground",
        amenity:
          "bg-perch-primary-50 text-perch-primary-700 border border-perch-primary-200 dark:bg-perch-primary-950/50 dark:text-perch-primary-400 dark:border-perch-primary-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
