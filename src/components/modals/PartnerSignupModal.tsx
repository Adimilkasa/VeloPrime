'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

type CustomerType = 'private' | 'company'
type PaymentMode = 'one' | 'installments'

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export type PartnerSignupModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: 'SOLO' | 'DUO' | 'TEAM'
  priceLabel: string
  paymentMode: PaymentMode
  installmentMonths: number
}

export function PartnerSignupModal({
  open,
  onOpenChange,
  planName,
  priceLabel,
  paymentMode,
  installmentMonths,
}: PartnerSignupModalProps) {
  const [state, setState] = React.useState<FormState>({ status: 'idle' })
  const [customerType, setCustomerType] = React.useState<CustomerType>('private')

  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [addressLine, setAddressLine] = React.useState('')
  const [postalCode, setPostalCode] = React.useState('')
  const [city, setCity] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [taxId, setTaxId] = React.useState('')
  const [note, setNote] = React.useState('')

  const [acceptTerms, setAcceptTerms] = React.useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = React.useState(false)
  const [acceptEarlyStart, setAcceptEarlyStart] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setState({ status: 'idle' })
    setCustomerType('private')
    setFullName('')
    setEmail('')
    setPhone('')
    setAddressLine('')
    setPostalCode('')
    setCity('')
    setCompanyName('')
    setTaxId('')
    setNote('')
    setAcceptTerms(false)
    setAcceptPrivacy(false)
    setAcceptEarlyStart(false)
  }, [open, planName, paymentMode, installmentMonths])

  function close() {
    onOpenChange(false)
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!acceptTerms || !acceptPrivacy || (customerType === 'private' && !acceptEarlyStart)) {
      setState({ status: 'error', message: 'Zaakceptuj wymagane zgody, aby kontynuować.' })
      return
    }

    setState({ status: 'submitting' })

    try {
      const response = await fetch('/api/partner-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'partnerstwo-modal',
          customerType,
          planName,
          paymentMode,
          installmentMonths: paymentMode === 'installments' ? installmentMonths : null,
          priceLabel,
          name: fullName,
          email,
          phone,
          addressLine,
          postalCode,
          city,
          company: companyName,
          taxId,
          note,
          consents: {
            acceptTerms,
            acceptPrivacy,
            acceptEarlyStart: customerType === 'private' ? acceptEarlyStart : null,
          },
        }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Nie udało się zapisać danych.')
      }

      setState({ status: 'success' })
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisu danych.',
      })
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="Zamknij" className="absolute inset-0 bg-black/40" onClick={close} />

          <div className="absolute inset-0 overflow-y-auto p-4 md:p-6">
            <div className="flex min-h-full items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-[880px]"
                role="dialog"
                aria-modal="true"
              >
                <Card className="overflow-hidden rounded-[28px] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.94))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-[62ch]">
                      <Badge variant="gold">Partnerstwo Velo Prime</Badge>
                      <Heading level={2} className="mt-4">
                        Wybierasz pakiet {planName}
                      </Heading>
                      <Text className="mt-3">
                        Uzupełnij dane do dalszego procesu. Na kolejnym etapie podłączymy finalną płatność online i logikę umowy dla wybranego typu klienta.
                      </Text>
                    </div>

                    <div className="rounded-2xl border border-stroke bg-bg-soft px-5 py-4 text-right">
                      <Text variant="muted">Wybrana forma</Text>
                      <div className="mt-1 text-sm font-medium text-text-primary">
                        {paymentMode === 'one' ? 'Płatność jednorazowa' : `Raty: ${installmentMonths} msc`}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-text-primary">{priceLabel}</div>
                    </div>
                  </div>

                  {state.status === 'success' ? (
                    <div className="mt-8 rounded-2xl border border-stroke bg-bg-primary p-6">
                      <Heading level={3} className="text-xl lg:text-xl">
                        Dane zostały zapisane
                      </Heading>
                      <Text className="mt-3">
                        Formularz dla pakietu {planName} został wysłany poprawnie. Kolejnym krokiem będzie spięcie tego przepływu z płatnością i dokumentami współpracy.
                      </Text>
                      <div className="mt-6">
                        <Button variant="primary" size="md" onClick={close}>
                          Zamknij
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="mt-8 grid gap-6">
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                        <div className="rounded-2xl border border-stroke bg-bg-soft p-5">
                          <Text variant="muted" className="uppercase tracking-[0.18em]">
                            Typ współpracy
                          </Text>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => setCustomerType('private')}
                              className={
                                'rounded-2xl border px-4 py-4 text-left transition ' +
                                (customerType === 'private'
                                  ? 'border-brand-gold bg-bg-section shadow-card'
                                  : 'border-stroke bg-bg-section/70 hover:border-brand-gold/30')
                              }
                            >
                              <div className="text-sm font-semibold text-text-primary">Osoba prywatna</div>
                              <div className="mt-1 text-sm text-text-secondary">Zakup indywidualny i umowa dla osoby fizycznej.</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCustomerType('company')}
                              className={
                                'rounded-2xl border px-4 py-4 text-left transition ' +
                                (customerType === 'company'
                                  ? 'border-brand-gold bg-bg-section shadow-card'
                                  : 'border-stroke bg-bg-section/70 hover:border-brand-gold/30')
                              }
                            >
                              <div className="text-sm font-semibold text-text-primary">Firma</div>
                              <div className="mt-1 text-sm text-text-secondary">Zakup na działalność gospodarczą z danymi firmowymi.</div>
                            </button>
                          </div>

                          <div className="mt-6 rounded-2xl border border-stroke bg-bg-section p-4">
                            <Text variant="muted">Podsumowanie pakietu</Text>
                            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-text-secondary">
                              <li>Pakiet: {planName}</li>
                              <li>Model płatności: {paymentMode === 'one' ? 'Jednorazowo' : `Raty (${installmentMonths} msc)`}</li>
                              <li>Na start: etap wdrożeniowy, szkolenia i przygotowanie do współpracy</li>
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-stroke bg-bg-section p-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <label className="text-sm text-text-secondary">Imię i nazwisko</label>
                              <input
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                required
                                className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="Jan Kowalski"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-text-secondary">Adres e-mail</label>
                              <input
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                type="email"
                                className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="email@domena.pl"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-text-secondary">Telefon</label>
                              <input
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                required
                                inputMode="tel"
                                className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="+48 ..."
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-sm text-text-secondary">Adres</label>
                              <input
                                value={addressLine}
                                onChange={(event) => setAddressLine(event.target.value)}
                                required
                                className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="Ulica i numer"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-text-secondary">Kod pocztowy</label>
                              <input
                                value={postalCode}
                                onChange={(event) => setPostalCode(event.target.value)}
                                required
                                className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="00-000"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-text-secondary">Miasto</label>
                              <input
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                required
                                className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="Warszawa"
                              />
                            </div>

                            {customerType === 'company' ? (
                              <>
                                <div className="sm:col-span-2">
                                  <label className="text-sm text-text-secondary">Nazwa firmy</label>
                                  <input
                                    value={companyName}
                                    onChange={(event) => setCompanyName(event.target.value)}
                                    required
                                    className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                    placeholder="Nazwa firmy"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="text-sm text-text-secondary">NIP</label>
                                  <input
                                    value={taxId}
                                    onChange={(event) => setTaxId(event.target.value)}
                                    required
                                    className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                    placeholder="1234567890"
                                  />
                                </div>
                              </>
                            ) : null}

                            <div className="sm:col-span-2">
                              <label className="text-sm text-text-secondary">Dodatkowe informacje (opcjonalnie)</label>
                              <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                className="mt-2 min-h-[110px] w-full rounded-md border border-stroke bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                                placeholder="Jeśli chcesz, dopisz krótką informację organizacyjną."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-stroke bg-bg-section p-5">
                        <Text variant="muted" className="uppercase tracking-[0.18em]">
                          Zgody i akceptacje
                        </Text>

                        <div className="mt-4 grid gap-3">
                          <label className="flex items-start gap-3 rounded-2xl border border-stroke bg-bg-primary p-4">
                            <input
                              type="checkbox"
                              checked={acceptTerms}
                              onChange={(event) => setAcceptTerms(event.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-stroke"
                            />
                            <span className="text-sm leading-relaxed text-text-secondary">
                              Akceptuję{' '}
                              <a href="/regulamin-partnerstwa" className="text-text-primary underline decoration-brand-gold/60 underline-offset-4">
                                Regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime
                              </a>
                              .
                            </span>
                          </label>

                          <label className="flex items-start gap-3 rounded-2xl border border-stroke bg-bg-primary p-4">
                            <input
                              type="checkbox"
                              checked={acceptPrivacy}
                              onChange={(event) => setAcceptPrivacy(event.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-stroke"
                            />
                            <span className="text-sm leading-relaxed text-text-secondary">
                              Zapoznałem się z{' '}
                              <a href="/polityka-prywatnosci" className="text-text-primary underline decoration-brand-gold/60 underline-offset-4">
                                Polityką prywatności
                              </a>
                              .
                            </span>
                          </label>

                          {customerType === 'private' ? (
                            <label className="flex items-start gap-3 rounded-2xl border border-stroke bg-bg-primary p-4">
                              <input
                                type="checkbox"
                                checked={acceptEarlyStart}
                                onChange={(event) => setAcceptEarlyStart(event.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-stroke"
                              />
                              <span className="text-sm leading-relaxed text-text-secondary">
                                Wyrażam zgodę na rozpoczęcie etapu wdrożeniowego przed upływem 14 dni od zawarcia umowy.
                              </span>
                            </label>
                          ) : null}
                        </div>

                        {state.status === 'error' ? (
                          <Text className="mt-4 text-red-600">{state.message}</Text>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Button type="submit" variant="primary" size="md" disabled={state.status === 'submitting'}>
                            {state.status === 'submitting' ? 'Zapisywanie…' : `Zapisz dane dla ${planName}`}
                          </Button>
                          <Button type="button" variant="secondary" size="md" onClick={close}>
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}