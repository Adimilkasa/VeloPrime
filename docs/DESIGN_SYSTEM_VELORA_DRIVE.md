# Velo Prime — Design System (Clean White Premium)

Ten dokument opisuje layout, grid, typografię, spacing oraz zasady UI dla strony głównej Velo Prime.

## 1) Grid i układ

### Kontener
- Maksymalna szerokość kontenera: **1280px**
- Kontener jest centrowany.

### Breakpointy
- **1440px+**
- **1280px**
- **1024px**
- **768px**
- **480px**

### Marginesy boczne (gutter)
- Desktop: **80px**
- Tablet: **40px**
- Mobile: **20px**

## 2) Spacing system

### Sekcje (padding góra/dół)
- Desktop: **120px**
- Tablet: **90px**
- Mobile: **70px**

### Odstępy wewnątrz sekcji
- Odstęp między nagłówkiem a treścią: **32–40px**
- Odstęp między elementami w sekcji (karty, kolumny, listy): **24–32px**

Zasada: **premium = dużo powietrza**.

## 3) Typografia

### Font
- Nowoczesny, lekki, elegancki: **Inter / Manrope / Plus Jakarta Sans**

### Skala typograficzna
- **H1 (Hero)**
  - Desktop: **56–64px**
  - Line-height: **1.1–1.2**
  - Weight: **500–600**
  - Letter-spacing: **-0.5px**

- **H2**
  - **36–42px**
  - Weight: **500**

- **H3**
  - **22–24px**
  - Weight: **500**

- **Body**
  - **16–18px**
  - Line-height: **1.6–1.7**
  - Weight: **400**

Zasada: nie używać zbyt ciężkich fontów.

## 4) Hero — proporcje

### Wysokość
- Desktop: **90vh**
- Minimalna wysokość: **720px**

### Układ
- Grid 2 kolumny **50/50**
- Lewa kolumna: max-width tekstu **520px**
- Prawa kolumna: obraz samochodów

## 5) Hero — obraz

### Render
- `object-fit: cover`
- `object-position: center`
- Unikać cropowania przodów aut (dostosowanie kadru na etapie przygotowania pliku lub `object-position`).

### Overlay gradient (czytelność)
- `linear-gradient(90deg, rgba(247,248,250,0.95) 0%, rgba(247,248,250,0.6) 40%, rgba(247,248,250,0) 70%)`

## 6) CTA — styl

### Primary CTA
- Tło: `linear-gradient(135deg, #C9A13B 0%, #E6C977 100%)`
- Tekst: `#FFFFFF`
- Padding: **16px 32px**
- Border-radius: **14px**
- Box-shadow: `0 8px 20px rgba(201,161,59,0.15)`

### Hover
- lekki wzrost jasności
- subtelny glow

## 7) Karty (Dlaczego / Modele)

- Border-radius: **16px**
- Box-shadow: `0 6px 20px rgba(0,0,0,0.05)`

### Hover
- `transform: translateY(-6px)`
- `box-shadow: 0 12px 30px rgba(0,0,0,0.08)`
- subtelna złota linia **2px u góry**

## 8) Finansowanie — karta premium

- Border-radius: **20px**
- Padding: **40px**
- Tło: `#FFFFFF`
- Dekor: cienka złota linia **3px**

## 9) Animacje

### Scroll reveal
- `opacity: 0 → 1`
- `transform: translateY(20px) → 0`
- duration: **0.6s**
- easing: **ease-out**

### Hover
- `transition: 0.2–0.3s`

Brak: agresywnych parallax, cząsteczek, intensywnych gradientów.

## 10) Zasada projektowa

Każda sekcja:
- 1 mocny nagłówek
- maks. 4 elementy wizualne
- jasny cel

Cel wrażenia:
- selekcyjna
- spokojna
- profesjonalna
- uporządkowana

Nie: startup tech / marketplace / salon wyprzedażowy.
