export type MediaItem = {
  src: string
  alt: string
}

export type ModelMedia = {
  hero: MediaItem[]
  exteriorGrid: MediaItem[]
  interior: {
    opener: MediaItem
    grid: MediaItem[]
  }
  details: MediaItem[]
}

// Backward-compatible alias (legacy name used by Seal 6 implementation)
export type Seal6DmiMedia = ModelMedia

export const seal6dmiMedia: ModelMedia = {
  hero: [
    { src: '/grafiki/seal-6-dmi/premium przod.jpg', alt: 'Zewnątrz – przód 3/4' },
    { src: '/grafiki/seal-6-dmi/premium bok.jpg', alt: 'Zewnątrz – profil' },
    { src: '/grafiki/seal-6-dmi/premium tył samochodu.jpg', alt: 'Zewnątrz – tył' },
    {
      src: '/grafiki/seal-6-dmi/03、SEAL-6_LHD_Sandstone_Exterior_Rear_download_JPG_5000PX_RGB (1).jpg',
      alt: 'Zewnątrz – tył (katalog)',
    },
  ],

  exteriorGrid: [
    { src: '/grafiki/seal-6-dmi/premium bok.jpg', alt: 'Profil' },
    { src: '/grafiki/seal-6-dmi/premium przod.jpg', alt: 'Przód' },
    { src: '/grafiki/seal-6-dmi/premium tył samochodu.jpg', alt: 'Tył' },
    { src: '/grafiki/seal-6-dmi/premium 3.jpg', alt: 'Zewnątrz – premium ujęcie' },
  ],

  interior: {
    opener: { src: '/grafiki/seal-6-dmi/kokpit jasne kanapy.jpg', alt: 'Kokpit – jasna tapicerka' },
    grid: [
      {
        src: '/grafiki/seal-6-dmi/kokpit jasne kanapy 2.jpg',
        alt: 'Kokpit – jasna tapicerka (ujęcie 2)',
      },
      { src: '/grafiki/seal-6-dmi/kokpit ciemne kanapy.jpg', alt: 'Kokpit – ciemna tapicerka' },
      { src: '/grafiki/seal-6-dmi/kanapy tylne jasne.jpg', alt: 'Tylna kanapa – jasna' },
      { src: '/grafiki/seal-6-dmi/tylne kanapy ciemne.jpg', alt: 'Tylna kanapa – ciemna' },
      { src: '/grafiki/seal-6-dmi/szklany dach.jpg', alt: 'Szklany dach' },
      { src: '/grafiki/seal-6-dmi/wyświetlacz.webp', alt: 'Wyświetlacz / infotainment' },
    ],
  },

  details: [
    { src: '/grafiki/seal-6-dmi/przednie leflektory.jpg', alt: 'Reflektory – detal' },
    { src: '/grafiki/seal-6-dmi/klamka led.jpg', alt: 'Klamka / ambient – detal' },
    { src: '/grafiki/seal-6-dmi/koło.jpg', alt: 'Felga – detal' },
    { src: '/grafiki/seal-6-dmi/ładowanie samochodu.jpg', alt: 'Ładowanie – PHEV' },
    { src: '/grafiki/seal-6-dmi/otwieranie smartfonem.jpg', alt: 'Otwieranie smartfonem' },
  ],
}
