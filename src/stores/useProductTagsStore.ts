import { defineStore } from 'pinia'
import type { ProductTagDto } from '../dtos/ProductTagDto'
import { http } from '../services/http'

interface ProductTagsState {
  items: ProductTagDto[]
  loading: boolean
  error: string | null
}

export const useProductTagsStore = defineStore('productTags', {
  state: (): ProductTagsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalProductTags: (state) => state.items.length,
  },

  actions: {
    async loadProductTags() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<ProductTagDto[]>('/product-tags')
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading product tags.'
      } finally {
        this.loading = false
      }
    },

    async createProductTag(payload: { name: string; description?: string | null }) {
      this.loading = true
      this.error = null
      try {
        const created = await http<ProductTagDto>('/product-tags', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while creating product tag.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateProductTag(id: number, payload: { name: string; description?: string | null }) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<ProductTagDto>(`/product-tags/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const idx = this.items.findIndex((t) => t.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while updating product tag.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteProductTag(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/product-tags/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((t) => t.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting product tag.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
