'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <Section variant="primary" className="min-h-[90vh] flex items-center">
      <div className="relative w-full">
        {/* Left-side overlay for text readability */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[72%] md:w-[65%]"
          style={{
            background:
              'linear-gradient(90deg, rgba(247,248,250,0.95) 0%, rgba(247,248,250,0.6) 40%, rgba(247,248,250,0) 70%)',
          }}
        />

        <div className="relative grid grid-cols-1 items-center gap-12 md:grid-cols-[3fr_2fr] lg:grid-cols-2">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-[620px]"
          >
            <Heading level={1}>
              Nowy wymiar motoryzacyjnego <span className="text-brand-gold">premium</span>.
            </Heading>
            <Text className="mt-6 max-w-[560px]">
              Starannie wyselekcjonowane modele, dopracowany proces i finansowanie dopasowane do Ciebie.
              <br />
              Bez presji. Bez chaosu. Bez kompromisów.
            </Text>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.12, staggerChildren: 0.12 },
                },
              }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <Button href="#kontakt" variant="primary" size="lg">
                  Umów konsultację
                </Button>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <Button href="#modele" variant="secondary" size="lg">
                  Zobacz modele
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: image */}
          <div className="relative">
            <div className="ml-auto w-full max-w-[720px]">
              <Image
                src="/assets/HERO.png"
                alt="Trzy modele samochodów: BYD, Omoda, JAECOO"
                width={1400}
                height={900}
                priority
                className="h-auto w-full object-contain drop-shadow-[0_14px_26px_rgba(0,0,0,0.08)]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
