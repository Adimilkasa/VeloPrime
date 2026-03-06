import * as React from 'react'
import { cn } from '@/lib/cn'

export type CardVariant = 'default' | 'hoverable'

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  goldTopLineOnHover?: boolean
}

export function Card({
  variant = 'default',
  goldTopLineOnHover = false,
  className,
  ...props
}: CardProps) {
  const hoverable =
    variant === 'hoverable'
      ? 'transition duration-200 ease-out hover:-translate-y-1.5 hover:shadow-cardHover'
      : ''

  const goldLine =
    goldTopLineOnHover && variant === 'hoverable'
      ? 'relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-brand-gold before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100'
      : ''

  return (
    <div
      className={cn(
        'rounded-lg border border-stroke bg-bg-section shadow-card',
        hoverable,
        goldLine,
        className,
      )}
      {...props}
    />
  )
}
