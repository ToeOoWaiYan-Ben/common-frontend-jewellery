export interface VendorDto {
  id: number

  buybackBasePrice: number | null
  deductionRate: number | null
  deductionAmount: number | null

  desc: string

  buybackPrice: number | null
  buybackDate: string | null // "YYYY-MM-DD"

  customerId: number
  goldPriceId: number
}
