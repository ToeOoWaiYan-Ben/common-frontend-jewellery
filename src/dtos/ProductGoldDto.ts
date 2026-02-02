export interface ProductGoldDto {
  id: number
  productId: number
  goldSourceId: number
  craftId: number
  weight: number
  goldPurity: number

  // ✅ display fields
  productName: string
  goldSourceName: string
  craftShopName: string
}
