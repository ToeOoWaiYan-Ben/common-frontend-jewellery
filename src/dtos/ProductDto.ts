export interface ProductDto {
  id: number
  name: string
  code: string
  stockStatus: string
  desc: string
  qty: number
  collection: string
  shortDesc: string
  color: string
  weight: number
  metarialLoss: number
  makingCost: number
  colorCount: number
  depreciation: number
  productTypeId: number | null
}
