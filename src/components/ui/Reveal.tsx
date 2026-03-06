'use client'

import * as React from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/cn'

export type RevealProps = {
  className?: string
  children: React.ReactNode
  delay?: number
}

export function Reveal({ className, children, delay = 0 }: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
