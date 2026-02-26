// services/purchaseApi.ts
import { http } from "./http"

export interface PurchaseItemRequest {
  productId: number
  qty: number
  sellingPrice: number
}

export interface PurchaseSaveRequest {
  customerId: number
  status: string
  discountAmount: number
  discountPercentage?: number
  items: PurchaseItemRequest[]
}

export const savePurchase = (data: PurchaseSaveRequest) => {
  return http.post('/invoices', data)
}

// ✅ ADD THIS
export const getPurchases = (params?: any) => {
  return http.get('/invoices', { params })
}