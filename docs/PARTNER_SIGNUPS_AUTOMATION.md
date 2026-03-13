# Partner Signups Automation

Cel: po rejestracji partnera zapisać pełne dane do Google Sheets, wysłać e-mail administracyjny, a po potwierdzeniu przelewu przenieść partnera do zakładki opłaconych, wysłać e-mail powitalny i krótkie powiadomienie na Discord.

## Vercel

Ta integracja docelowo działa na Vercel, więc sekrety nie powinny być trzymane w repozytorium.

Rekomendowany sposób konfiguracji:

- Project Settings -> Environment Variables w Vercel
- ustaw wartości przynajmniej dla środowiska `Production`
- po zapisaniu zmiennych wykonaj redeploy projektu
- dla Google Service Account na Vercel używaj `GOOGLE_SERVICE_ACCOUNT_JSON`, a nie pliku lokalnego

Minimalny zestaw zmiennych do uruchomienia pełnego procesu na Vercel:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_PARTNER_SIGNUPS_SHEET_ID`
- `GOOGLE_PARTNER_SIGNUPS_PENDING_SHEET_TAB`
- `GOOGLE_PARTNER_SIGNUPS_PAID_SHEET_TAB`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `PARTNER_SIGNUP_ADMIN_EMAIL`
- `DISCORD_PARTNER_SIGNUPS_WEBHOOK_URL`

`GOOGLE_PARTNER_SIGNUPS_SHEET_ID` może być samym ID arkusza albo pełnym linkiem Google Sheets. Kod wyciągnie ID automatycznie.

## Google Sheets

Arkusz powinien mieć dwie zakładki:

- `GOOGLE_PARTNER_SIGNUPS_PENDING_SHEET_TAB` – osoby, które wypełniły formularz, ale nie potwierdziły jeszcze płatności
- `GOOGLE_PARTNER_SIGNUPS_PAID_SHEET_TAB` – osoby, które kliknęły potwierdzenie przelewu

Rekomendowany układ kolumn w wierszu 1:

- `Data zgloszenia`
- `Data potwierdzenia wplaty`
- `Pakiet`
- `Platnosc`
- `Liczba rat`
- `Kwota`
- `Typ klienta`
- `Imie i nazwisko`
- `Firma`
- `NIP`
- `E-mail`
- `Telefon`
- `Adres`
- `Kod pocztowy`
- `Miasto`
- `Notatka`
- `Regulamin`
- `Polityka prywatnosci`
- `Wczesniejsze wdrozenie`
- `ID zgloszenia`

Do zapisu używany jest ten sam Service Account, który może już obsługiwać synchronizację z Google Sheets.

Na Vercel najlepiej wkleić cały JSON klucza service account do zmiennej `GOOGLE_SERVICE_ACCOUNT_JSON` w jednej linii.

Kolumna `ID zgloszenia` jest utrzymywana technicznie do przenoszenia rekordu między zakładkami i jest automatycznie ukrywana w arkuszu.

## E-mail

Wysyłka działa przez SMTP. Potrzebne zmienne środowiskowe:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `PARTNER_WELCOME_REPLY_TO` (opcjonalnie)
- `PARTNER_SIGNUP_ADMIN_EMAIL`

Mail powitalny jest wysyłany dopiero po kliknięciu `Wykonałem przelew`. Treść jest tymczasowa i można ją później podmienić w `src/lib/partnerSignup.ts`.

Jeśli `PARTNER_SIGNUP_ADMIN_EMAIL` nie jest ustawiony, powiadomienie administracyjne poleci na adres z `SMTP_FROM`.

## Discord

Powiadomienie jest wysyłane na zwykły webhook Discorda dopiero po kliknięciu `Wykonałem przelew`:

- `DISCORD_PARTNER_SIGNUPS_WEBHOOK_URL`

Treść webhooka zawiera: imię i nazwisko, telefon, miejscowość i pakiet.

## Kolejność zdarzeń

- wysłanie formularza: zapis do zakładki bez płatności i e-mail administracyjny
- kliknięcie `Wykonałem przelew`: przeniesienie do zakładki partnerów, mail powitalny i Discord