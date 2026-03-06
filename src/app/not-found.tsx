import Link from 'next/link'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <Section variant="white" aria-label="Nie znaleziono">
      <div className="max-w-[70ch]">
        <Heading level={1}>Nie znaleziono strony</Heading>
        <Text className="mt-4">Wygląda na to, że ten adres nie istnieje lub został zmieniony.</Text>
      </div>

      <div className="mt-10">
        <Button asChild variant="secondary" size="md">
          <Link href="/">Wróć na stronę główną</Link>
        </Button>
      </div>
    </Section>
  )
}
