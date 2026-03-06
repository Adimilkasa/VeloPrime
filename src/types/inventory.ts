export type Availability = 'IN_STOCK' | 'OUT_OF_STOCK'

export type Powertrain = 'BEV' | 'PHEV' | 'OTHER'

export type InventoryItem = {
  brand: string
  model: string
  trim: string
  year: number

  // optional legacy field
  bodyType?: string

  // list/catalog price (gross + net) from sheet
  listPriceGross: number
  listPriceNet?: number

  // sale price (gross + net) from sheet
  ourPriceGross: number
  ourPriceNet?: number

  powertrain?: Powertrain
  availability: Availability

  // used to resolve images in /public/cars
  imageKey: string
}
