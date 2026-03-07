'use client'

import { motion } from 'framer-motion'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

export function HeroFullBleed() {
  return (
    <Section
      variant="primary"
      className="relative flex items-center overflow-hidden py-10 md:py-20 lg:py-28 min-h-[78vh] md:min-h-[90vh] bg-[url('/assets/HERO.png')] bg-cover bg-no-repeat bg-[position:72%_42%] md:bg-[position:78%_34%]"
    >
      <div className="relative grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,640px)_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="min-w-0 max-w-[640px]"
        >
          <div className="min-w-0 rounded-2xl bg-white/40 backdrop-blur-lg ring-1 ring-black/10 shadow-card px-5 py-6 sm:px-6 sm:py-7">
            <Heading
              level={1}
              className="max-w-[26ch] text-[clamp(1.65rem,6vw,2.25rem)] sm:text-5xl lg:text-6xl"
            >
              Nowy wymiar motoryzacyjnego <span className="text-brand-gold">premium</span>.
            </Heading>

            <Text className="mt-6 max-w-[60ch]">
              Starannie wyselekcjonowane modele, dopracowany proces i finansowanie dopasowane do Ciebie.
              <br />
              Bez presji. Bez chaosu. Bez kompromisów.
            </Text>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.12, staggerChildren: 0.14 },
                },
              }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                <Button href="/#kontakt" variant="primary" size="lg">
                  Umów konsultację
                </Button>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                <Button href="/#modele" variant="secondary" size="lg">
                  Zobacz modele
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right column intentionally left light (background carries the image) */}
        <div className="hidden md:block" />
      </div>
    </Section>
  )
}
