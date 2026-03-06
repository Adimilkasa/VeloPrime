import * as React from 'react'
import { cn } from '@/lib/cn'

export type BadgeVariant = 'gold' | 'neutral'

const stylesByVariant: Record<BadgeVariant, string> = {
  gold: 'border border-[rgba(201,161,59,0.25)] bg-[rgba(201,161,59,0.12)] text-brand-goldDark',
  neutral: 'border border-stroke bg-bg-primary text-text-secondary',
}

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        stylesByVariant[variant],
        className,
      )}
      {...props}
    />
  )
}
