import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { ProductImageDto } from '../dtos/ProductImageDto'
import type { ImageDto } from '../dtos/ImageDto'

/**
 * Keep it loose because your ProductDto contains nested sets
 * (productGolds, productJewellerys) and you already map in backend.
 */
export interface ProductDto {
  id: number
  name: string
  code?: string | null
  stockStatus?: string | null
  desc?: string | null
  qty?: number | null
  collection?: string | null
  shortDesc?: string | null
  color?: string | null
  weight?: number | null
  metarialLoss?: number | null
  makingCost?: number | null
  colorCount?: number | null
  depreciation: number
  productTypeId?: number | null

  productGolds?: any[]
  productJewellerys?: any[]
  productImages?: ProductImageDto[]
}

interface ProductsState {
  items: ProductDto[]
  loading: boolean
  error: string | null
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalProducts: (state) => state.items.length,
  },

  actions: {
    async loadProducts() {
      this.loading = true
      this.error = null
      try {
        const raw = await http<ProductDto[]>('/products')
        this.items = (raw ?? []).map((p: any) => ({
          ...p,
          id: Number(p.id),
          productTypeId: p.productTypeId != null ? Number(p.productTypeId) : null,
        }))
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading products.'
      } finally {
        this.loading = false
      }
    },

    async getProductById(id: number) {
      this.loading = true
      this.error = null
      try {
        const p = await http<ProductDto>(`/products/${Number(id)}`)
        return p
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load product.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async createProduct(payload: any) {
      this.loading = true
      this.error = null
      try {
        const created = await http<ProductDto>('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        // optional: refresh list so table is always correct
        await this.loadProducts()
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create product.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id: number, payload: any) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<ProductDto>(`/products/${Number(id)}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        await this.loadProducts()
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update product.'
        throw e
      } finally {
        this.loading = false
      }
    },
    async loadByTypeId(typeId: number) {
      this.loading = true
      this.error = null
      try {
        const raw = await http<ProductDto[]>(`/products/type/${Number(typeId)}`)
        this.items = (raw ?? []).map((p: any) => ({
          ...p,
          id: Number(p.id),
          productTypeId: p.productTypeId != null ? Number(p.productTypeId) : null,
        }))
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load products by type.'
        throw e
      } finally {
        this.loading = false
      }
    },

    /**
     * ✅ THIS is what your ProductListView is calling.
     * Adds the missing function so no more "not a function" error.
     */
    async deleteProduct(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/products/${Number(id)}`, { method: 'DELETE' })

        // Update UI immediately
        this.items = this.items.filter((p) => Number(p.id) !== Number(id))
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete product.'
        throw e
      } finally {
        this.loading = false
      }
    },
    async addProductImage(productId: number, payload: { imageUrl: string; title?: string | null }) {
      this.loading = true
      this.error = null

      try {
        const pid = Number(productId)

        const updated = await http<ProductDto>(`/products/${pid}/images`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const idx = this.items.findIndex((x) => Number(x.id) === pid)
        if (idx !== -1) this.items[idx] = updated

        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to add product image.'
        throw e
      } finally {
        this.loading = false
      }
    },
    async uploadToS3(file: File): Promise<string> {
      const fd = new FormData()
      fd.append('file', file)

      const image = await http<ImageDto>('/images/upload', {
        method: 'POST',
        body: fd,
      })

      return image.url // must match ImageDto field name
    },

    async deleteProductImage(imageId: number, productId: number) {
      this.loading = true
      this.error = null

      try {
        const pid = Number(productId)
        const iid = Number(imageId)

        await http<void>(`/products/images/${iid}`, {
          method: 'DELETE',
        })

        const idx = this.items.findIndex((p) => Number(p.id) === pid)
        if (idx === -1) return

        const item = this.items[idx]
        if (!item) return

        // ensure array exists
        const currentImages = item.productImages ?? []

        item.productImages = currentImages.filter((img) => Number(img.id) !== iid)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete product image.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
