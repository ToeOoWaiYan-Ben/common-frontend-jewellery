import { defineStore } from 'pinia'
import type { ProductTagDto } from '@/dtos/ProductTagDto'
import { http } from '@/services/http'

interface ProductTagsState {
  items: ProductTagDto[]
  loading: boolean
  error: string | null // ✅ only for loadTags()
}

type ProductTagApi = {
  id: number
  name?: string | null
  description?: string | null

  // (optional) in case backend returns different keys
  tagName?: string | null
  tag_name?: string | null
}

function mapToProductTagDto(x: ProductTagApi): ProductTagDto {
  return {
    id: x.id,
    name: (x.name ?? x.tagName ?? x.tag_name ?? '') as string,
    description: (x.description ?? null) as string | null,
  }
}

export const useProductTagsStore = defineStore('productTags', {
  state: (): ProductTagsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalTags: (s) => s.items.length,
  },

  actions: {
    async loadTags() {
      this.loading = true
      this.error = null
      try {
        const raw = await http<ProductTagApi[]>('/product-tags')
        this.items = raw.map(mapToProductTagDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading product tags.'
      } finally {
        this.loading = false
      }
    },

    async createTag(payload: Omit<ProductTagDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          description: payload.description?.trim() || null,
        }

        const createdRaw = await http<ProductTagApi>('/product-tags', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToProductTagDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateTag(id: number, payload: Omit<ProductTagDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          description: payload.description?.trim() || null,
        }

        const updatedRaw = await http<ProductTagApi>(`/product-tags/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToProductTagDto(updatedRaw)

        const idx = this.items.findIndex((t) => t.id === id)
        if (idx === -1) {
          await this.loadTags()
          return
        }
        this.items[idx] = updated
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteTag(id: number) {
      this.loading = true
      try {
        await http<void>(`/product-tags/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((t) => t.id !== id)
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
