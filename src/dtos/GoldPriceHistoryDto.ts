export type GoldPriceStatus = 'ACTIVE' | 'INACTIVE'
export type GoldPurity = 'K24' | 'K22' | 'K18' | 'K14'

export interface GoldPriceHistoryDto {
  id: number
  recordDate: string // "2026-02-02"
  status: GoldPriceStatus
  purity: GoldPurity
  buyPrice: number
  sellPrice: number
  createdAt?: string
  updatedAt?: string
}
