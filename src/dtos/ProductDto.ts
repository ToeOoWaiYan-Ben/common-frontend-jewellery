import type { ProductImageDto } from './ProductImageDto'
export interface ProductGoldItemDto {
  id?: number
  goldSourceId: number
  craftId: number
  weight: number
  goldPurity: string
  goldSourceName?: string
  craftShopName?: string
}

export interface ProductJewelleryItemDto {
  id?: number
  gemsPackageId: number
  qty: number
  sellingPrice: number
  gemsPackageName?: string
  originalPrice?: number
  unitWeight?: number
}

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
  productTypeId: number

  // ✅ matches backend fields
  productGolds: ProductGoldItemDto[]
  productJewellerys: ProductJewelleryItemDto[]
  productImages?: ProductImageDto[]
}
