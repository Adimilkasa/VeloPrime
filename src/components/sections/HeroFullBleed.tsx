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
      className="relative flex min-h-[72svh] items-end overflow-hidden py-6 sm:min-h-[78vh] sm:items-center sm:py-10 md:min-h-[90vh] md:py-20 lg:py-28 bg-[url('/assets/HERO.png')] bg-cover bg-no-repeat bg-[position:62%_46%] sm:bg-[position:72%_42%] md:bg-[position:78%_34%]"
    >
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,229,0.34)_0%,rgba(244,239,229,0.42)_26%,rgba(244,239,229,0.78)_74%,rgba(244,239,229,0.92)_100%)] sm:bg-[linear-gradient(90deg,rgba(244,239,229,0.84)_0%,rgba(244,239,229,0.64)_30%,rgba(244,239,229,0.12)_58%,rgba(244,239,229,0)_100%)]" />
      <div className="relative grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,640px)_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="min-w-0 max-w-[640px] w-full"
        >
          <div className="min-w-0 rounded-2xl bg-white/58 px-4 py-5 backdrop-blur-lg ring-1 ring-black/10 shadow-card sm:bg-white/40 sm:px-6 sm:py-7">
            <Heading
              level={1}
              className="max-w-[26ch] text-[clamp(1.65rem,6vw,2.25rem)] sm:text-5xl lg:text-6xl"
            >
              Nowy wymiar motoryzacyjnego <span className="text-brand-gold">premium</span>.
            </Heading>

            <Text className="mt-4 max-w-[60ch] text-sm leading-6 sm:mt-6 sm:text-base sm:leading-7">
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
              className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                <Button href="/#kontakt" variant="primary" size="lg" className="w-full sm:w-auto">
                  Umów konsultację
                </Button>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                <Button href="/#modele" variant="secondary" size="lg" className="w-full sm:w-auto">
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
