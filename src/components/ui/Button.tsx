import * as React from 'react'
import Link from 'next/link'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke focus-visible:ring-offset-2 focus-visible:ring-offset-bg-section'

const variants: Record<ButtonVariant, string> = {
  primary:
    'rounded-md bg-brand-gold text-white shadow-cta hover:bg-brand-goldDark hover:shadow-[0_10px_24px_rgba(201,161,59,0.18)] disabled:opacity-100',
  secondary:
    'rounded-md border border-stroke bg-transparent text-text-primary hover:bg-bg-primary',
  ghost: 'rounded-md bg-transparent text-text-primary hover:bg-bg-primary',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
  href?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  asChild,
  href,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (href && !asChild) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    )
  }

  const Comp = asChild ? Slot : 'button'
  return <Comp className={classes} {...props} />
}
