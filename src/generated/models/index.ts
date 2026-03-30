import type { ModelPageContent } from '@/lib/modelPageContent'
import bydAtto2 from './byd-atto-2.json'
import bydAtto2Dmi from './byd-atto-2-dm-i.json'
import bydDolphinSurf from './byd-dolphin-surf.json'
import bydSeal5 from './byd-seal-5.json'
import bydSeal6Touring from './byd-seal-6-touring.json'
import bydSeal6 from './byd-seal-6.json'
import bydSealU from './byd-seal-u.json'
import bydSeal from './byd-seal.json'
import bydSealion7 from './byd-sealion-7.json'

export const generatedBySlug: Record<string, ModelPageContent> = {
  'byd-atto-2': bydAtto2 as ModelPageContent,
  'byd-atto-2-dm-i': bydAtto2Dmi as ModelPageContent,
  'byd-dolphin-surf': bydDolphinSurf as ModelPageContent,
  'byd-seal-5': bydSeal5 as ModelPageContent,
  'byd-seal-6-touring': bydSeal6Touring as ModelPageContent,
  'byd-seal-6': bydSeal6 as ModelPageContent,
  'byd-seal-u': bydSealU as ModelPageContent,
  'byd-seal': bydSeal as ModelPageContent,
  'byd-sealion-7': bydSealion7 as ModelPageContent,
}
