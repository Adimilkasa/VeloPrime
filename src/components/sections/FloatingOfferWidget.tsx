'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircleMore, X } from 'lucide-react'

import { usePricingMode } from '@/components/providers/PricingModeProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

type OfferLeadState = {
  name: string
  phone: string
  email: string
  message: string
}

const INITIAL_STATE: OfferLeadState = {
  name: '',
  phone: '',
  email: '',
  message: '',
}

export function FloatingOfferWidget() {
  const pathname = usePathname()
  const { mode } = usePricingMode()
  const [open, setOpen] = React.useState(false)
  const [lead, setLead] = React.useState<OfferLeadState>(INITIAL_STATE)
  const [acceptPrivacy, setAcceptPrivacy] = React.useState(false)
  const [acceptContact, setAcceptContact] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const shouldRender = pathname === '/' || pathname === '/modele' || pathname.startsWith('/modele/')

  if (!shouldRender) {
    return null
  }

  function close() {
    setOpen(false)
  }

  function resetForm() {
    setLead(INITIAL_STATE)
    setAcceptPrivacy(false)
    setAcceptContact(false)
    setStatus('idle')
    setMessage('')
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/offer-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          pricingMode: mode,
          source: pathname === '/' ? 'home-floating-widget' : 'modele-floating-widget',
          consents: {
            acceptPrivacy,
            acceptContact,
          },
        }),
      })

      const json = (await response.json().catch(() => null)) as null | { ok?: boolean; error?: string; message?: string }
      if (!response.ok || !json?.ok) {
        setStatus('error')
        setMessage(json?.error || 'Nie udało się wysłać formularza. Spróbuj ponownie.')
        return
      }

      setStatus('success')
      setMessage(json.message || 'Dziękujemy. Wrócimy z ofertą tak szybko, jak to możliwe.')
      setLead(INITIAL_STATE)
      setAcceptPrivacy(false)
      setAcceptContact(false)
    } catch {
      setStatus('error')
      setMessage('Nie udało się wysłać formularza. Spróbuj ponownie.')
    }
  }

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-40 md:inset-x-auto md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#b6841c] bg-[linear-gradient(135deg,#ebc971,#b6841c)] px-5 py-4 text-left text-white shadow-[0_18px_38px_rgba(182,132,28,0.28)] transition hover:shadow-[0_22px_44px_rgba(182,132,28,0.34)] md:w-auto"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12">
            <MessageCircleMore className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">CTA oferty</span>
            <span className="block text-base font-semibold leading-tight">Otrzymaj ofertę</span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <button type="button" aria-label="Zamknij" className="absolute inset-0 bg-black/45" onClick={close} />

            <div className="absolute inset-0 overflow-y-auto overscroll-contain p-4">
              <div className="flex min-h-full items-end justify-center md:items-center">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="w-full max-w-[760px] max-h-[calc(100dvh-2rem)]"
                role="dialog"
                aria-modal="true"
              >
                <Card className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[28px] border-brand-gold/35 bg-[linear-gradient(180deg,#111111,#18130f)] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)] md:p-8">
                  <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-gold/16 blur-3xl" />
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
                  </div>

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="max-w-[48ch]">
                      <Badge variant="gold">Otrzymaj ofertę</Badge>
                      <Heading level={2} className="mt-4 text-white">Zostaw kontakt, a przygotujemy dla Ciebie ofertę</Heading>
                      <Text className="mt-3 text-white/80">
                        Zostaw podstawowe dane kontaktowe, a wrócimy z ofertą stworzoną specjalnie dla Ciebie.
                      </Text>
                    </div>

                    <Button variant="ghost" size="sm" onClick={close} className="shrink-0 text-white hover:bg-white/10 hover:text-white">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="relative mt-6 overflow-y-auto rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm md:p-5">
                    {status === 'success' ? (
                      <div className="rounded-[20px] border border-emerald-300/30 bg-emerald-500/10 px-6 py-8 text-center">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Formularz wysłany</div>
                        <div className="mt-3 text-2xl font-semibold text-white">Dziękujemy za zapytanie</div>
                        <div className="mt-4 text-sm leading-relaxed text-white/85">{message}</div>
                        <div className="mt-6 flex justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/14"
                            onClick={() => {
                              resetForm()
                              close()
                            }}
                          >
                            Zamknij
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form className="grid gap-4" onSubmit={onSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <div className="text-xs font-semibold text-white/90">Imię i nazwisko</div>
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-white/14 bg-white/10 px-4 text-sm text-white outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
                              value={lead.name}
                              onChange={(event) => setLead((state) => ({ ...state, name: event.target.value }))}
                              autoComplete="name"
                              required
                            />
                          </label>

                          <label className="block">
                            <div className="text-xs font-semibold text-white/90">Telefon</div>
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-white/14 bg-white/10 px-4 text-sm text-white outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
                              value={lead.phone}
                              onChange={(event) => setLead((state) => ({ ...state, phone: event.target.value }))}
                              inputMode="tel"
                              autoComplete="tel"
                              required
                            />
                          </label>

                          <label className="block">
                            <div className="text-xs font-semibold text-white/90">Email (opcjonalnie)</div>
                            <input
                              className="mt-2 h-11 w-full rounded-xl border border-white/14 bg-white/10 px-4 text-sm text-white outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
                              value={lead.email}
                              onChange={(event) => setLead((state) => ({ ...state, email: event.target.value }))}
                              inputMode="email"
                              autoComplete="email"
                            />
                          </label>
                        </div>

                        <label className="block">
                          <div className="text-xs font-semibold text-white/90">Wiadomość (opcjonalnie)</div>
                          <textarea
                            className="mt-2 min-h-[108px] w-full rounded-xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
                            value={lead.message}
                            onChange={(event) => setLead((state) => ({ ...state, message: event.target.value }))}
                          />
                        </label>

                        <div className="grid gap-3">
                          <label className="flex items-start gap-3">
                            <input
                              className="mt-0.5 h-4 w-4 rounded border border-white/25 bg-white/10 accent-[#c9a13b]"
                              type="checkbox"
                              checked={acceptPrivacy}
                              onChange={(event) => setAcceptPrivacy(event.target.checked)}
                              required
                            />
                            <span className="text-xs leading-relaxed text-white/80">
                              Akceptuję <a className="underline decoration-brand-gold/60 underline-offset-2" href="/polityka-prywatnosci">politykę prywatności</a>.
                            </span>
                          </label>

                          <label className="flex items-start gap-3">
                            <input
                              className="mt-0.5 h-4 w-4 rounded border border-white/25 bg-white/10 accent-[#c9a13b]"
                              type="checkbox"
                              checked={acceptContact}
                              onChange={(event) => setAcceptContact(event.target.checked)}
                              required
                            />
                            <span className="text-xs leading-relaxed text-white/80">
                              Wyrażam zgodę na kontakt telefoniczny i e-mailowy w sprawie oferty.
                            </span>
                          </label>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <Text className="text-sm text-white/70">Odpowiadamy możliwie szybko w godzinach pracy.</Text>
                          <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Wysyłanie…' : 'Wyślij i otrzymaj ofertę'}
                          </Button>
                        </div>

                        {status === 'error' ? <div className="text-sm font-medium text-red-300">{message}</div> : null}
                      </form>
                    )}
                  </div>
                </Card>
              </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}