'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { calculateLeaseMonthly } from '@/lib/lease'
import { formatPLN } from '@/lib/pricing'
import { usePricingMode } from '@/components/providers/PricingModeProvider'

export type FinanceModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicleLabel: string
  clientPriceGross: number
  defaultMonths?: 36 | 48 | 60
}

export function FinanceModal({
  open,
  onOpenChange,
  vehicleLabel,
  clientPriceGross,
  defaultMonths = 60,
}: FinanceModalProps) {
  const { mode } = usePricingMode()
  const [months, setMonths] = React.useState<36 | 48 | 60>(defaultMonths)
  const [segment, setSegment] = React.useState<'B2C' | 'B2B'>('B2C')

  const [preferredContact, setPreferredContact] = React.useState<'Telefon' | 'SMS' | 'WhatsApp'>('Telefon')

  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [city, setCity] = React.useState('')

  React.useEffect(() => {
    if (!open) return
    setMonths(defaultMonths)
    setSegment(mode === 'business' ? 'B2B' : 'B2C')
    setPreferredContact('Telefon')
  }, [open, defaultMonths, mode])

  const monthly = calculateLeaseMonthly({ clientPriceGross, months })

  function close() {
    onOpenChange(false)
  }

  function submit() {
    console.log('[TODO /api/lead]', {
      vehicleLabel,
      clientPriceGross,
      months,
      segment,
      name,
      phone,
      city,
      preferredContact,
    })
    close()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Zamknij"
            className="absolute inset-0 bg-black/30"
            onClick={close}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-[720px]"
              role="dialog"
              aria-modal="true"
            >
              <Card className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <Badge variant="gold">Finansowanie</Badge>
                    <Heading level={2} className="mt-3">
                      Sprawdź ratę
                    </Heading>
                    <Text variant="muted" className="mt-2">
                      {vehicleLabel} • Cena dla klienta: {formatPLN(clientPriceGross)}
                    </Text>
                  </div>
                  <Button variant="ghost" size="sm" onClick={close} className="shrink-0">
                    Zamknij
                  </Button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-stroke bg-bg-primary p-5">
                    <Text variant="muted">Rata (estymacja)</Text>
                    <div className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary tabular-nums">
                      <span className="whitespace-nowrap">{formatPLN(monthly)}</span>
                      <span className="text-sm sm:text-base font-medium text-text-muted whitespace-nowrap"> / mies.</span>
                    </div>
                    <Text variant="muted" className="mt-2">
                      Rata jest estymacją – finalna zależy od banku i parametrów umowy.
                    </Text>

                    <div className="mt-4">
                      <label className="text-sm text-text-secondary">Okres</label>
                      <select
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value) as 36 | 48 | 60)}
                        className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                      >
                        <option value={36}>36 miesięcy</option>
                        <option value={48}>48 miesięcy</option>
                        <option value={60}>60 miesięcy</option>
                      </select>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-text-secondary">Segment:</span>
                        <button
                          type="button"
                          onClick={() => setSegment('B2C')}
                          className={`h-9 rounded-full px-4 text-sm border transition ${
                            segment === 'B2C'
                              ? 'border-stroke bg-bg-section text-text-primary'
                              : 'border-stroke bg-transparent text-text-secondary'
                          }`}
                        >
                          B2C
                        </button>
                        <button
                          type="button"
                          onClick={() => setSegment('B2B')}
                          className={`h-9 rounded-full px-4 text-sm border transition ${
                            segment === 'B2B'
                              ? 'border-stroke bg-bg-section text-text-primary'
                              : 'border-stroke bg-transparent text-text-secondary'
                          }`}
                        >
                          B2B
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-stroke bg-bg-section p-5">
                    <Heading level={3}>Kontakt</Heading>

                    <div className="mt-4 grid gap-3">
                      <div>
                        <label className="text-sm text-text-secondary">Imię</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                          placeholder="Twoje imię"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-text-secondary">Telefon</label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                          placeholder="+48 ..."
                          inputMode="tel"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-text-secondary">Preferowany kontakt</label>
                        <select
                          value={preferredContact}
                          onChange={(e) => setPreferredContact(e.target.value as 'Telefon' | 'SMS' | 'WhatsApp')}
                          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                        >
                          <option value="Telefon">Telefon</option>
                          <option value="SMS">SMS</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-text-secondary">Miasto (opcjonalnie)</label>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                          placeholder="np. Wrocław"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button variant="primary" size="md" onClick={submit}>
                        Wyślij i sprawdź
                      </Button>
                      <Button variant="secondary" size="md" onClick={close}>
                        Wróć
                      </Button>
                    </div>

                    <Text variant="muted" className="mt-3">
                      TODO: integracja z <span className="text-text-secondary">/api/lead</span>
                    </Text>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
