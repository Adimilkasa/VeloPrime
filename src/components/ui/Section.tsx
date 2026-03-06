import * as React from 'react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

export type SectionVariant = 'primary' | 'soft' | 'white'

const bgByVariant: Record<SectionVariant, string> = {
  primary: 'bg-bg-primary',
  soft: 'bg-bg-soft',
  white: 'bg-bg-section',
}

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  id?: string
  variant?: SectionVariant
  title?: string
  subtitle?: string
}

export function Section({
  id,
  variant = 'white',
  title,
  subtitle,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-16 md:py-20 lg:py-28', bgByVariant[variant], className)}
      {...props}
    >
      <Container>
        {(title || subtitle) && (
          <div className="mb-10 max-w-2xl">
            {title && <Heading level={2}>{title}</Heading>}
            {subtitle && <Text variant="muted" className="mt-3">{subtitle}</Text>}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
