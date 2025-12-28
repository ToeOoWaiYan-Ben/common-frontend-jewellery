export interface GemsPackageDto {
  id: number
  name: string
  packageNumber: number | null

  gemsSize: number | null
  gemsWeight: number | null

  color: string | null
  cutting: string | null
  description: string | null
  originalPrice: number | null
  buyDate: string | null
  gemType: string | null
  certificateId: number | null
  sellerId: number | null
  sellerName: string | null
}
