import * as React from 'react'
import { cn } from '@/lib/cn'

export type ContainerProps<T extends React.ElementType = 'div'> = {
  as?: T
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className'>

export function Container<T extends React.ElementType = 'div'>(props: ContainerProps<T>) {
  const { as, className, ...rest } = props
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn('mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-20', className)}
      {...rest}
    />
  )
}
