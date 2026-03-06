import * as React from 'react'
import { cn } from '@/lib/cn'

export type TextVariant = 'body' | 'secondary' | 'muted'

const stylesByVariant: Record<TextVariant, string> = {
  body: 'text-base lg:text-lg leading-relaxed text-text-secondary',
  secondary: 'text-sm lg:text-base leading-relaxed text-text-secondary',
  muted: 'text-sm text-text-muted',
}

export type TextProps<T extends React.ElementType = 'p'> = {
  as?: T
  variant?: TextVariant
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

export function Text<T extends React.ElementType = 'p'>(props: TextProps<T>) {
  const { as, variant = 'body', className, children, ...rest } = props
  const Comp = (as ?? 'p') as React.ElementType

  return (
    <Comp className={cn(stylesByVariant[variant], className)} {...rest}>
      {children}
    </Comp>
  )
}
