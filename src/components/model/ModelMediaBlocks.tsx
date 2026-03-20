import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { EnlargeableImage } from '@/components/ui/EnlargeableImage'

import type { ModelMedia } from '@/lib/media/seal6dmiMedia'

function Tile({
  item,
  sizes,
  galleryImages,
  imageIndex,
}: {
  item: { src: string; alt: string }
  sizes: string
  galleryImages: Array<{ src: string; alt: string }>
  imageIndex: number
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl bg-bg-soft p-0">
      <div className="relative aspect-[16/10]">
        <EnlargeableImage
          src={item.src}
          alt={item.alt}
          sizes={sizes}
          className="absolute inset-0"
          galleryImages={galleryImages}
          imageIndex={imageIndex}
        />
      </div>
    </Card>
  )
}

export function ModelMediaBlocks({ media }: { media: ModelMedia }) {
  const exteriorImages = media.exteriorGrid.map((item) => ({ src: item.src, alt: item.alt }))
  const interiorImages = [media.interior.opener, ...media.interior.grid].map((item) => ({ src: item.src, alt: item.alt }))
  const detailImages = media.details.map((item) => ({ src: item.src, alt: item.alt }))

  return (
    <div className="mt-6 grid gap-12 md:mt-8">
      <div>
        <Heading level={3} className="text-xl">Z zewnątrz</Heading>
        <Text variant="muted" className="mt-2 max-w-[70ch]">
          Detale i linia nadwozia — w krótkiej siatce ujęć.
        </Text>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {media.exteriorGrid.map((item, index) => (
            <Tile
              key={item.src}
              item={item}
              sizes="(max-width: 768px) 100vw, 640px"
              galleryImages={exteriorImages}
              imageIndex={index}
            />
          ))}
        </div>
      </div>

      <div>
        <Heading level={3} className="text-xl">Wnętrze</Heading>
        <Text variant="muted" className="mt-2 max-w-[70ch]">
          Materiały, przestrzeń i detale kokpitu — w ujęciach, które pokazują realne wrażenie.
        </Text>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Tile
            item={media.interior.opener}
            sizes="(max-width: 768px) 100vw, 640px"
            galleryImages={interiorImages}
            imageIndex={0}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {media.interior.grid.map((item, index) => (
              <Tile
                key={item.src}
                item={item}
                sizes="(max-width: 768px) 50vw, 320px"
                galleryImages={interiorImages}
                imageIndex={index + 1}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <Heading level={3} className="text-xl">Detale</Heading>
        <Text variant="muted" className="mt-2 max-w-[70ch]">
          To, co zwykle robi różnicę w odbiorze premium — światła, wykończenie, funkcje.
        </Text>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.details.map((item, index) => (
            <Tile
              key={item.src}
              item={item}
              sizes="(max-width: 768px) 100vw, 420px"
              galleryImages={detailImages}
              imageIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
