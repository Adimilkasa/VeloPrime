'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { generatedBySlug } from '@/generated/models'
import { resolveCarImageSrc } from '@/lib/carImage'
import {
  type ModelGroup,
} from '@/lib/modelGroups'
import { Badge } from '@/components/ui/Badge'

const technicalLabelByIcon = {
  battery: 'Ładowanie',
  shield: 'Bateria / bezpieczeństwo',
  gauge: 'Asystenci / prowadzenie',
  zap: 'Technologia',
  timer: 'Osiągi',
  fuel: 'Funkcje',
  camera: 'Parkowanie',
  sun: 'Komfort',
  award: 'Gwarancja',
  sparkles: 'Wyposażenie',
} as const

function isConcreteTechnicalValue(value: string) {
  return /\d|kW|kWh|km|LFP|ACC|AEB|ELKA|ICC|FCW|TSR|CTB|iTAC|OBC|DM-i/i.test(value)
}

export function ModelGroupCard({ group }: { group: ModelGroup }) {
  const [imgSrc, setImgSrc] = React.useState<string>('/cars/placeholder.svg')

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const src = await resolveCarImageSrc(group.imageKey || group.model)
      if (!cancelled) setImgSrc(src)
    })()
    return () => {
      cancelled = true
    }
  }, [group.imageKey, group.model])

  const href = `/modele/${group.slug}`
  const yearLabel =
    group.years.length > 1
      ? `${group.years[group.years.length - 1]}-${group.years[0]}`
      : group.years[0]
        ? String(group.years[0])
        : null
  const generatedContent = generatedBySlug[group.slug]
  const versionNames = React.useMemo(() => {
    const generatedVersions = generatedContent?.sections?.versions?.cards?.items
      ?.map((item) => item.trim?.trim())
      .filter(Boolean)

    const source = generatedVersions?.length ? generatedVersions : group.trims
    return source.slice(0, 3)
  }, [generatedContent, group.trims])

  const extraVersionNames = Math.max(group.trims.length - versionNames.length, 0)
  const technicalHighlights = React.useMemo(() => {
    const rows = generatedContent?.sections?.strengths?.board?.rows
    if (!rows) return []

    return [rows.row1, rows.row2, rows.row3]
      .flat()
      .filter((item) => item?.value)
      .filter((item) => isConcreteTechnicalValue(item.value))
      .slice(0, 3)
      .map((item) => ({
        label: technicalLabelByIcon[item.icon],
        value: item.value,
      }))
  }, [generatedContent])
  const strengthsPreview = React.useMemo(() => {
    const strengths = (generatedContent?.sections?.strengths?.items ?? [])
      .map((item) => item.title?.trim())
      .filter(Boolean)
    const technicalFallbacks = technicalHighlights.map((item) => `${item.label}: ${item.value}`)

    return [...new Set([...strengths, ...technicalFallbacks])].slice(0, 5)
  }, [generatedContent, technicalHighlights])

  return (
    <Link
      href={href}
      aria-label={`Sprawdź szczegóły: ${group.brand} ${group.model}`}
      className="group relative block overflow-hidden rounded-[26px] border border-stroke/90 bg-[linear-gradient(180deg,#fffdf9_0%,#f8f3ea_100%)] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/45 hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-stroke focus-visible:ring-offset-2 focus-visible:ring-offset-bg-section"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/12 blur-3xl opacity-80" />
        <div className="absolute left-[28%] top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full bg-white/60 blur-3xl lg:block" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
      </div>

      <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)_250px] lg:gap-5">
          <div
            className="relative overflow-hidden rounded-[24px] border border-white/70 bg-cover bg-center bg-no-repeat shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
            style={{ backgroundImage: "url('/cars/t%C5%82o%202.png')" }}
          >
            <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#8f793d]/18 via-[#8f793d]/6 to-transparent p-2.5 sm:p-4">
              <div className="rounded-[22px] border border-[rgba(201,161,59,0.26)] bg-[linear-gradient(180deg,rgba(255,252,246,0.94),rgba(244,234,214,0.9))] p-2.5 text-text-primary shadow-[0_18px_44px_rgba(88,66,18,0.16)] backdrop-blur-md sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[rgba(201,161,59,0.26)] bg-[rgba(201,161,59,0.12)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-goldDark sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                      {group.powertrain === 'BEV' ? 'Electric Drive' : group.powertrain === 'PHEV' ? 'Plug-in Hybrid' : 'Nowy model'}
                    </span>
                    {yearLabel ? (
                      <span className="rounded-full border border-stroke/80 bg-white/76 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-text-secondary shadow-[0_8px_18px_rgba(19,26,43,0.05)] sm:px-3 sm:text-[10px] sm:tracking-[0.16em]">
                        Rocznik {yearLabel}
                      </span>
                    ) : null}
                  </div>

                  <span className="rounded-full border border-[#c9a13b]/45 bg-[linear-gradient(135deg,rgba(235,201,113,0.92),rgba(182,132,28,0.88))] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(165,125,31,0.2)] sm:px-3 sm:text-[10px] sm:tracking-[0.16em]">
                    Dostępny od ręki
                  </span>
                </div>

                <div className="mt-3 rounded-2xl border border-stroke/75 bg-white/72 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_18px_rgba(88,66,18,0.05)]">
                  <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8b6a21]">Wersje</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {versionNames.map((trim) => (
                      <span key={trim} className="rounded-full border border-brand-gold/20 bg-white/90 px-2 py-1 text-[10px] font-semibold text-text-primary sm:px-2.5">
                        {trim}
                      </span>
                    ))}
                    {extraVersionNames > 0 ? (
                      <span className="rounded-full border border-brand-gold/20 bg-[#fbf4e6] px-2 py-1 text-[10px] font-semibold text-[#7b5a15] sm:px-2.5">
                        +{extraVersionNames}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[260px] lg:h-full lg:min-h-[280px] lg:aspect-auto">
              <Image
                src={imgSrc}
                alt={`${group.brand} ${group.model}`}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-contain px-4 pb-3 pt-10 transition-transform duration-500 group-hover:scale-[1.035] sm:px-5 sm:pb-4 sm:pt-12"
                style={{ objectPosition: 'center 75%' }}
                priority={false}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#f6ecda]/95 via-[#f8f1e4]/78 to-transparent p-2.5 sm:p-4">
              <div className="rounded-[20px] border border-[rgba(182,132,28,0.18)] bg-white/82 px-4 py-3 shadow-[0_12px_28px_rgba(88,66,18,0.08)] backdrop-blur-sm">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8b6a21]">{group.brand}</p>
                <p className="mt-1 text-lg font-semibold leading-none tracking-tight text-text-primary sm:text-[22px]">{group.model}</p>
              </div>
            </div>

          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between rounded-[24px] border border-white/60 bg-white/72 p-4 backdrop-blur-sm sm:p-5 lg:p-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6a21]">Najważniejsze</p>
                  <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-text-primary sm:text-[28px]">
                    Kluczowe informacje o modelu.
                  </h3>
                </div>

                <div className="hidden sm:block">
                  <Badge variant="gold" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                    {group.powertrain === 'BEV' ? 'BEV' : group.powertrain === 'PHEV' ? 'PHEV' : 'Model'}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 rounded-[20px] border border-stroke/80 bg-[#fffdfa] p-4 shadow-[0_10px_24px_rgba(88,66,18,0.04)] sm:mt-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Kluczowe cechy</div>
                <div className="mt-3 grid gap-2">
                  {strengthsPreview.length ? (
                    strengthsPreview.map((item) => (
                      <div key={item} className="rounded-2xl border border-stroke/75 bg-white px-3 py-2.5 text-sm font-medium text-text-primary shadow-[0_8px_18px_rgba(19,26,43,0.04)] sm:py-3">
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-stroke/75 bg-white px-3 py-3 text-sm text-text-secondary">
                      Kluczowe cechy modelu znajdziesz po wejściu w pełną kartę.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-stroke/70 pt-4 lg:hidden">
              <div className="sm:hidden">
                <Badge variant="gold" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                  {group.powertrain === 'BEV' ? 'BEV' : group.powertrain === 'PHEV' ? 'PHEV' : 'Model'}
                </Badge>
              </div>

              <span className="ml-auto inline-flex h-10 items-center justify-center rounded-md border border-[#b6841c] bg-[linear-gradient(135deg,#ebc971,#b6841c)] px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(182,132,28,0.24)] transition group-hover:shadow-[0_18px_34px_rgba(182,132,28,0.32)] sm:min-w-[180px]">
                Sprawdź szczegóły
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[24px] border border-[#ead9b4] bg-[linear-gradient(180deg,#fffdf8_0%,#f4ead7_100%)] p-4 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5 lg:min-h-full">
            <div>
              <div className="rounded-[20px] border border-white/70 bg-white/58 p-4 shadow-[0_10px_24px_rgba(88,66,18,0.05)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Finansowanie</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-brand-gold/20 bg-[#fbf4e6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b5a15]">
                    Leasing
                  </span>
                  <span className="rounded-full border border-brand-gold/20 bg-[#fbf4e6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b5a15]">
                    Kredyt
                  </span>
                  <span className="rounded-full border border-brand-gold/20 bg-[#fbf4e6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b5a15]">
                    Zakup firmowy i prywatny
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/70 bg-white/55 p-4 shadow-[0_10px_24px_rgba(88,66,18,0.05)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Parametry w skrócie</div>
              <div className="mt-3 space-y-2">
                {technicalHighlights.length ? (
                  technicalHighlights.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-stroke/75 bg-[#fffdfa] px-3 py-2.5">
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8b6a21]">{item.label}</div>
                      <div className="mt-1 text-sm font-semibold text-text-primary">{item.value}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-stroke/75 bg-[#fffdfa] px-3 py-2.5 text-sm leading-relaxed text-text-secondary">
                    Kluczowe parametry i wyposażenie są dostępne po wejściu w pełną kartę modelu.
                  </div>
                )}
              </div>
            </div>

            <span className="mt-5 hidden h-11 items-center justify-center rounded-md border border-[#b6841c] bg-[linear-gradient(135deg,#ebc971,#b6841c)] px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(182,132,28,0.24)] transition group-hover:shadow-[0_18px_34px_rgba(182,132,28,0.32)] lg:inline-flex">
              Sprawdź szczegóły
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
