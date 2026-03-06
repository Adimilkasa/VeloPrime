# Google Sheets → inventory sync

Cel: trzymać listę dostępnych aut w Google Sheets i jednym poleceniem generować z tego plik JSON używany przez stronę: `src/data/inventory.json`.

## 1) Arkusz (kolumny)

W pierwszym wierszu zrób nagłówki. Skrypt rozpoznaje kilka nazw (PL/EN).

Jeśli trzymasz dane w zakładce `DANE` z nagłówkami typu `Marka`, `Wersja`, `Rocznik`, `Cena katalogowa BRUTTO`, `Cena sprzedaży BRUTTO/NETTO`, `Typ napędu` — to też jest obsługiwane.

- `brand`
- `model`
- `trim`
- `bodyType` (opcjonalnie; jeśli brak, ustawiamy `—`)
- `year`
- `listPriceNet` (katalogowa netto — pokazywana jako przekreślona w trybie Firma)
- `listPriceGross` (katalogowa brutto — pokazywana jako przekreślona w trybie Prywatnie)
- `ourPriceGross` (sprzedaż brutto — cena dla klientów prywatnych)
- `ourPriceNet` (sprzedaż netto — cena dla firm; opcjonalnie, ale zalecane)
- `powertrain` (opcjonalnie; np. `BEV` / `PHEV` albo PL typu `Elektryczny`, `Hybryda Plug-in` — jeśli brak, model trafi do sekcji Hybrydowe jako fallback)
- `availability` (opcjonalnie; np. `IN_STOCK` / `OUT_OF_STOCK`, albo `TAK` / `NIE`; jeśli brak kolumny, domyślnie `IN_STOCK`)
- `imageKey` (opcjonalnie — jeśli puste/brak kolumny, skrypt ustawia `model`, żeby pasowało do zdjęć `public/cars/<Model>.webp`)

## 2) Dostęp (Service Account)

1. Google Cloud Console → utwórz projekt
2. Włącz **Google Sheets API**
3. Utwórz **Service Account** i pobierz JSON
4. Zapisz plik jako `.secrets/google-service-account.json` (folder jest w `.gitignore`)
5. W Google Sheets kliknij **Udostępnij** i dodaj e-mail service accounta jako **Odbiorca / Viewer**

### Szybki wariant (bez Google Cloud)

Jeśli ustawisz w Google Sheets udostępnianie jako **„Każdy, kto ma link” → Wyświetlający**, skrypt potrafi pobrać dane bez kluczy (CSV z endpointu Google).
Wtedy możesz pominąć Service Account i po prostu ustawić `GOOGLE_SHEET_ID` i `GOOGLE_SHEET_TAB`.

## 3) Konfiguracja `.env.local`

Utwórz `.env.local` (lokalnie) i ustaw:

```bash
GOOGLE_SERVICE_ACCOUNT_FILE=.secrets/google-service-account.json
GOOGLE_SHEET_ID=...   # id z URL arkusza
GOOGLE_SHEET_TAB=DANE
GOOGLE_SHEETS_RANGE=A1:Z

# (Opcjonalnie, polecane w trybie public CSV)
# Jeśli pobierasz bez Service Account i masz w pliku kilka zakładek,
# ustaw GID zakładki `DANE` (w URL po przełączeniu zakładki: #gid=...)
GOOGLE_SHEET_GID=...
```

Uwaga: skrypt ładuje `.env` a potem `.env.local` (lokalne ustawienia mają priorytet).

## 4) Sync

W katalogu projektu uruchom:

```bash
npm run sync:inventory
```

Po syncu uruchom `npm run build` / `npm run dev` i sprawdź stronę.
