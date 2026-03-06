# Workflow: tworzenie zakładek modeli (/modele/[slug]) + generowanie treści (OpenAI)

Ten dokument opisuje powtarzalny proces dodawania nowego modelu do strony (zakładka modelu + treści z PDF) oraz aktualizacji istniejących modeli.

## 0) Wymagania

- Node.js 18.17+ (zalecane 20+)
- Zmienna środowiskowa `OPENAI_API_KEY` (albo plik z kluczem w katalogu projektu: `secret` / `secret.txt` / `Secret.txt`)

Skrypty:
- `npm run sync:inventory` — aktualizuje `src/data/inventory.json` z Google Sheets
- `npm run generate:model -- --slug <slug>` — generuje `src/generated/models/<slug>.json`

## 1) Ustal `slug` modelu (musi być spójny z inventory)

Zakładki modeli działają pod `GET /modele/<slug>`.

`slug` jest liczony z inventory jako:
- `brand + model` po normalizacji (małe litery, bez znaków diakrytycznych, spacje → `-`)

Przykłady:
- `BYD` + `Dolphin Surf` → `byd-dolphin-surf`
- `BYD` + `Seal 6` → `byd-seal-6`

Jeśli `slug` nie pasuje do wygenerowanego JSON-a, strona weźmie fallback bez mediów (a hero może być pusty).

### Szybkie wypisanie slugów z inventory

Generator ma tryb pomocniczy, który wypisuje wszystkie slugi wykryte w inventory (dla pozycji `IN_STOCK`) wraz ze statusem plików:

```bash
node scripts/generate-model-content.cjs --list-slugs
```

## 2) Dodaj/uzupełnij inventory

Źródło prawdy dla cen i dostępności to `src/data/inventory.json`.

- Jeśli korzystasz z arkusza: uruchom `npm run sync:inventory`
- Upewnij się, że dla modelu istnieją pozycje z `availability: "IN_STOCK"`
- `trim` powinien odpowiadać wersjom, które chcesz pokazać

Uwaga o cenach w sekcji „Wersje”:
- UI wybiera najtańszy dostępny egzemplarz (`ourPriceGross`) dla danej wersji (trim)

## 3) Dodaj PDF specyfikacji

Dodaj plik PDF do:
- `public/spec/<slug>.pdf` (najprościej trzymać nazwę zgodną ze slugiem)

Przykład:
- `public/spec/byd-dolphin-surf.pdf`

## 4) Dodaj grafiki do `public/grafiki/…`

Dla każdego modelu trzymaj grafiki w jednym katalogu, np.:
- `public/grafiki/byd-dolphin-surf/…`
- `public/grafiki/seal-6-dmi/…`

Nazewnictwo plików steruje przypisaniem do sekcji:
- `premium` / `przemium` → hero slider
- `wnetrze` → wnętrze
- `zewnatrz` → z zewnątrz
- `detal` / `detale` → detale

W każdej kategorii może być dowolna liczba plików — generator weźmie tyle, ile jest.

## 5) Wygeneruj treści JSON dla modelu (OpenAI)

Podstawowe użycie:

```bash
npm run generate:model -- --slug <slug>
```

Opcjonalnie możesz wskazać pliki ręcznie:

```bash
npm run generate:model -- --slug <slug> --pdf public/spec/<slug>.pdf --imagesDir public/grafiki/<folder>
```

Co powstaje:
- `src/generated/models/<slug>.json`
- mapowanie w `src/generated/models/index.ts`

## 6) Walidacja

1) Uruchom dev:

```bash
npm run dev
```

2) Otwórz:
- `http://localhost:3000/modele/<slug>`

Sprawdź:
- hero slider ma zdjęcia `premium…`
- „Mocne strony” są poprawne
- „Wersje” pokazują ceny z inventory (najtańszy dostępny egzemplarz per trim)
- PDF link działa (`/spec/<slug>.pdf`)

3) Build:

```bash
npm run build
```

## 7) Typowe problemy i szybkie diagnozy

- **Hero nie ma zdjęć**: najczęściej `slug` strony nie pasuje do `src/generated/models/<slug>.json` albo w mediach brakuje `premium`.
- **Złe ceny w „Wersje”**: sprawdź `availability`, `ourPriceGross` oraz czy `trim` w inventory odpowiada wersjom.
- **Dziwne znaki w nazwach plików**: trzymaj spacje/diakrytyki OK, ale nie dokładaj ręcznego `%20` w nazwach w kodzie — public URL jest normalizowany po stronie UI.
