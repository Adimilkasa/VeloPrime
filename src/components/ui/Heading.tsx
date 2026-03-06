import * as React from 'react'
import { cn } from '@/lib/cn'

type HeadingLevel = 1 | 2 | 3

const stylesByLevel: Record<HeadingLevel, string> = {
  1: 'text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary',
  2: 'text-3xl lg:text-4xl font-semibold tracking-tight text-text-primary',
  3: 'text-xl lg:text-2xl font-semibold text-text-primary',
}

export type HeadingProps<T extends React.ElementType = 'h2'> = {
  level: HeadingLevel
  as?: T
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

export function Heading<T extends React.ElementType = 'h2'>(props: HeadingProps<T>) {
  const { level, as, className, children, ...rest } = props
  const defaultTag = (level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3') as React.ElementType
  const Comp = (as ?? defaultTag) as React.ElementType

  return (
    <Comp className={cn(stylesByLevel[level], className)} {...rest}>
      {children}
    </Comp>
  )
}
