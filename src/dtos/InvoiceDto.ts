export interface InvoiceSaveRequestDto {
  customerId: number
  status: 'DRAFT' | 'CONFIRMED'
  discountAmount: number | null
  discountPercentage: number | null
  items: Array<{
    productId: number
    qty: number
    sellingPrice: number
  }>
}

export interface InvoiceResponseDto {
  id: number
  invoiceNo: string
  customerId: number
  subTotal: number
  discountAmount: number
  discountPercentage: number | null
  finalPrice: number
  status: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: number
    productId: number
    qty: number
    sellingPrice: number
    subtotal: number
    discountAmount: number
    finalPrice: number
  }>
}
