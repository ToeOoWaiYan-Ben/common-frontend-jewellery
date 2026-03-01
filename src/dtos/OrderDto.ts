export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'BACKORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type OrderItemType = 'PRODUCT' | 'CUSTOM'

export interface OrderGoldDto {
  goldSourceId: number
  craftId: number
  weightPerUnit: number
}

export interface OrderJewelleryDto {
  gemsPackageId: number
  qtyPerUnit: number
}

export interface OrderItemDto {
  type: OrderItemType
  productId?: number | null
  productName?: string | null
  unitPrice?: number | null
  qty: number
  customNote?: string | null
  goldRows?: OrderGoldDto[]
  jewelleryRows?: OrderJewelleryDto[]
}

export interface OrderDto {
  id?: number
  customerName?: string
  customerPhone?: string
  status?: OrderStatus
  totalPrice?: number
  items: OrderItemDto[]
  createdAt?: string
}