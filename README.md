# Velo Prime — UI System (Next.js + Tailwind + Framer Motion)

Bazowy system komponentów UI w stylistyce **Clean White Premium** z subtelnymi złotymi akcentami.

## Wymagania

- Node.js 18.17+ (zalecane 20+)

## Start

```bash
npm install
npm run dev
```

Aplikacja: `http://localhost:3000`

## Modele (workflow)

Powtarzalny proces dodawania/aktualizacji zakładek modeli oraz generowania treści z PDF (OpenAI) jest opisany w:

- `docs/MODEL_PAGES_WORKFLOW.md`

## Komponenty

Ścieżki:

- `src/components/ui/Container.tsx`
- `src/components/ui/Section.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Heading.tsx`
- `src/components/ui/Text.tsx`
- `src/components/ui/Reveal.tsx` (scroll reveal)

Helper:

- `src/lib/cn.ts` — `clsx` + `tailwind-merge`

## Tokeny stylu

Zdefiniowane w `tailwind.config.ts`:

- Kolory: `bg.*`, `text.*`, `brand.*`, `stroke`
- Cienie: `shadow-card`, `shadow-cardHover`, `shadow-cta`
- Zaokrąglenia: `rounded-md`, `rounded-lg`, `rounded-xl`

## Przykład użycia

Demo UI jest w `src/app/page.tsx`.

Przykład buttonów:

```tsx
<Button variant="primary" size="md">Umów konsultację</Button>
<Button variant="secondary">Zobacz ofertę</Button>
<Button variant="ghost">Kontakt</Button>
```

## Build

```bash
npm run build
npm run start
```
