// src/stores/useProductsStore.ts
import { defineStore } from 'pinia'
import { http } from '../services/http'

export interface ProductDto {
  id: number
  name: string
  code: string
  stockStatus: string
  desc: string
  qty: number
  collection: string
  shortDesc: string
  color: number
  weight: number
  metarialLoss: number
  makingCost: number
  colorCount: number
  depreciation: number
  productTypeId: number
}

interface ProductsState {
  items: ProductDto[]
  loading: boolean
  error: string | null
}

type ProductApi = {
  id: number
  name?: string | null
  code?: string | null
  stockStatus?: string | null
  stock_status?: string | null
  desc?: string | null
  shortDesc?: string | null
  short_desc?: string | null
  qty?: number | null
  collection?: string | null
  color?: number | null
  weight?: number | null
  metarialLoss?: number | null
  metarial_loss?: number | null
  makingCost?: number | null
  making_cost?: number | null
  colorCount?: number | null
  color_count?: number | null
  depreciation?: number | null
  productTypeId?: number | null
  product_type_id?: number | null
}

function mapToProductDto(x: ProductApi): ProductDto {
  return {
    id: x.id,
    name: (x.name ?? '') as string,
    code: (x.code ?? '') as string,
    stockStatus: (x.stockStatus ?? x.stock_status ?? '') as string,
    desc: (x.desc ?? '') as string,
    qty: Number(x.qty ?? 0),
    collection: (x.collection ?? '') as string,
    shortDesc: (x.shortDesc ?? x.short_desc ?? '') as string,
    color: Number(x.color ?? 0),
    weight: Number(x.weight ?? 0),
    metarialLoss: Number(x.metarialLoss ?? x.metarial_loss ?? 0),
    makingCost: Number(x.makingCost ?? x.making_cost ?? 0),
    colorCount: Number(x.colorCount ?? x.color_count ?? 0),
    depreciation: Number(x.depreciation ?? 0),
    productTypeId: Number(x.productTypeId ?? x.product_type_id ?? 1),
  }
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
        const raw = await http<ProductApi[]>('/products')
        this.items = raw.map(mapToProductDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading products.'
      } finally {
        this.loading = false
      }
    },

    async createProduct(payload: Omit<ProductDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          code: payload.code?.trim(),
          stockStatus: payload.stockStatus?.trim(),
          desc: payload.desc?.trim(),
          collection: payload.collection?.trim(),
          shortDesc: payload.shortDesc?.trim(),

          // ✅ numbers - NO trim
          qty: Number(payload.qty ?? 0),
          color: Number(payload.color ?? 0),
          colorCount: Number(payload.colorCount ?? 0),
          weight: Number(payload.weight ?? 0),
          metarialLoss: Number(payload.metarialLoss ?? 0),
          makingCost: Number(payload.makingCost ?? 0),
          depreciation: Number(payload.depreciation ?? 0),
          productTypeId: Number(payload.productTypeId ?? 1),
        }

        const createdRaw = await http<ProductApi>('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToProductDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id: number, payload: Omit<ProductDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          code: payload.code?.trim(),
          stockStatus: payload.stockStatus?.trim(),
          desc: payload.desc?.trim(),
          collection: payload.collection?.trim(),
          shortDesc: payload.shortDesc?.trim(),

          // ✅ numbers - NO trim
          qty: Number(payload.qty ?? 0),
          color: Number(payload.color ?? 0),
          colorCount: Number(payload.colorCount ?? 0),
          weight: Number(payload.weight ?? 0),
          metarialLoss: Number(payload.metarialLoss ?? 0),
          makingCost: Number(payload.makingCost ?? 0),
          depreciation: Number(payload.depreciation ?? 0),
          productTypeId: Number(payload.productTypeId ?? 1),
        }

        const updatedRaw = await http<ProductApi>(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToProductDto(updatedRaw)

        const idx = this.items.findIndex((p) => p.id === id)
        if (idx === -1) {
          await this.loadProducts()
          return
        }

        this.items[idx] = updated
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: number) {
      this.loading = true
      try {
        await http<void>(`/products/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((p) => p.id !== id)
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
