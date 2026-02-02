export interface CustomerDto {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  customerType: 'REGULAR' | 'VIP' | 'WHOLESALE'
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
  createdAt?: string
  updatedAt?: string
}
