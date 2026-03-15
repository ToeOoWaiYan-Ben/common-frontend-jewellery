export interface VendorItemDto {
    id?: number
  
    purchaseItemId: number
    productId: number
    qty: number
  
    sellingPrice: number
    deductionAmount: number | null
    finalBuybackPrice: number
  }