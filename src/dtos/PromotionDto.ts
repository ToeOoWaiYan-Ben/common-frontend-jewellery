export interface PromotionDto {
  id: number
  name: string
  discountRate: number
  description?: string | null
  startDate: string // "YYYY-MM-DD"
  endDate: string // "YYYY-MM-DD"
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}
