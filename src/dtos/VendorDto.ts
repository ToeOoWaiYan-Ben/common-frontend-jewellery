import type { VendorItemDto } from './VendorItemDto'

export interface VendorDto {
  id?: number

  invoiceId: number
  customerId: number
  invoiceNo?: string | null

  desc: string
  buybackDate: string | null // YYYY-MM-DD

  totalBuybackPrice: number | null

  items: VendorItemDto[]
}