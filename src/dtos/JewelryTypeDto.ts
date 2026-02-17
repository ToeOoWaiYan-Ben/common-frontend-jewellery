export interface JewelryTypeDto {
  id: number
  name: string
  categoryId: number | null
  description?: string | null
  categoryName?: string | null
  imageUrl?: string | null
}
