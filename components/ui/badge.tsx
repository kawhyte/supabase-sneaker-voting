import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "px-xxs py-xxs text-xs border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "px-xxs py-xxs text-xs border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "px-xxs py-xxs text-xs border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "px-xxs py-xxs text-xs text-foreground",
        yellow:
          "px-xxs py-xxs text-xs bg-[var(--color-primary-200)] text-[var(--color-primary-900)] border-[var(--color-primary-300)]",
        green:
          "px-xxs py-xxs text-xs bg-[var(--color-green-100)] text-[var(--color-green-700)] border-[var(--color-green-200)]",
        blue:
          "px-xxs py-xxs text-xs bg-[var(--color-blue-100)] text-[var(--color-blue-700)] border-[var(--color-blue-200)]",
        purple:
          "px-xxs py-xxs text-xs bg-[var(--color-purple-100)] text-[var(--color-purple-700)] border-[var(--color-purple-200)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }