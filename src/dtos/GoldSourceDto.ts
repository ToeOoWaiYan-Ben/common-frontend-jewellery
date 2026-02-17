export interface GoldSourceDto {
  id: number
  goldPurity: string
  weight: number
  color: string
  sourceCountry: string
  originalPrice: number
  sellerId: number | null
  name: string
}