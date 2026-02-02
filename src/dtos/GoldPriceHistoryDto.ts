export type GoldPriceStatus = 'ACTIVE' | 'INACTIVE'
export type GoldPurity = 'K24' | 'K22' | 'K18' | 'K14'
export type GoldUnit = 'MMK_PER_KYAT' | 'MMK_PER_GRAM'

export interface GoldPriceHistoryDto {
  id: number
  recordDate: string // "2026-02-02"
  status: GoldPriceStatus
  purity: GoldPurity
  unit: GoldUnit
  buyPrice: number
  sellPrice: number
  createdAt?: string
  updatedAt?: string
}
