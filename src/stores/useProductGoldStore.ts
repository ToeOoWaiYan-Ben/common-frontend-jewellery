import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { ProductGoldDto } from '../dtos/ProductGoldDto'

interface ProductGoldState {
  items: ProductGoldDto[]
  loading: boolean
  error: string | null
}

type ProductGoldApi = {
  id: number
  productId?: number | null
  goldSourceId?: number | null
  craftId?: number | null
  weight?: number | null
  goldPurity?: number | null
  productName?: string | null
  goldSourceName?: string | null
  craftShopName?: string | null
}

function mapToDto(x: ProductGoldApi): ProductGoldDto {
  return {
    id: x.id,
    productId: Number(x.productId ?? 0),
    goldSourceId: Number(x.goldSourceId ?? 0),
    craftId: Number(x.craftId ?? 0),
    weight: Number(x.weight ?? 0),
    goldPurity: Number(x.goldPurity ?? 0),

    productName: (x.productName ?? '') as string,
    goldSourceName: (x.goldSourceName ?? '') as string,
    craftShopName: (x.craftShopName ?? '') as string,
  }
}

export const useProductGoldStore = defineStore('productGold', {
  state: (): ProductGoldState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    total: (s) => s.items.length,
  },

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        const raw = await http<ProductGoldApi[]>('/product-gold')
        this.items = raw.map(mapToDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading product gold.'
      } finally {
        this.loading = false
      }
    },

    async create(
      payload: Omit<ProductGoldDto, 'id' | 'productName' | 'goldSourceName' | 'craftShopName'>
    ) {
      this.loading = true
      try {
        const body = {
          productId: Number(payload.productId),
          goldSourceId: Number(payload.goldSourceId),
          craftId: Number(payload.craftId),
          weight: Number(payload.weight),
          goldPurity: Number(payload.goldPurity),
        }

        const createdRaw = await http<ProductGoldApi>('/product-gold', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(
      id: number,
      payload: Omit<ProductGoldDto, 'id' | 'productName' | 'goldSourceName' | 'craftShopName'>
    ) {
      this.loading = true
      try {
        const body = {
          productId: Number(payload.productId),
          goldSourceId: Number(payload.goldSourceId),
          craftId: Number(payload.craftId),
          weight: Number(payload.weight),
          goldPurity: Number(payload.goldPurity),
        }

        const updatedRaw = await http<ProductGoldApi>(`/product-gold/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToDto(updatedRaw)
        const idx = this.items.findIndex((x) => x.id === id)
        if (idx === -1) {
          await this.loadAll()
          return
        }
        this.items[idx] = updated
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async delete(id: number) {
      this.loading = true
      try {
        await http<void>(`/product-gold/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
