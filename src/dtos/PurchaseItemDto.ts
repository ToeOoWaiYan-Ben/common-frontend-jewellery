export interface PurchaseItemDto {
  productId: number
  productName?: string
  productCode?: string
  qty: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseDto {
  id: number
  invoiceNo?: string | null
  purchaseDate: string // "2026-02-27"
  customerId: number
  customerName?: string | null
  customerPhone?: string | null
  discount: number
  subtotal: number
  total: number
  items?: PurchaseItemDto[]
  createdAt?: string
  updatedAt?: string
}
