import { defineStore } from 'pinia'
import type { ProductDto } from '../dtos/ProductDto'
import { http } from '../services/http'

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
  qty?: number | null
  collection?: string | null
  shortDesc?: string | null
  short_desc?: string | null
  color?: string | null
  weight?: number | null
  metarialLoss?: number | null
  metarial_loss?: number | null
  makingCost?: number | null
  making_cost?: number | null
  colorCount?: number | null
  color_count?: number | null
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
    qty: (x.qty ?? 0) as number,
    collection: (x.collection ?? '') as string,
    shortDesc: (x.shortDesc ?? x.short_desc ?? '') as string,
    color: (x.color ?? '') as string,
    weight: (x.weight ?? 0) as number,
    metarialLoss: (x.metarialLoss ?? x.metarial_loss ?? 0) as number,
    makingCost: (x.makingCost ?? x.making_cost ?? 0) as number,
    colorCount: (x.colorCount ?? x.color_count ?? 0) as number,
    productTypeId: (x.productTypeId ?? x.product_type_id ?? 0) as number,
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
          qty: payload.qty,
          collection: payload.collection?.trim(),
          shortDesc: payload.shortDesc?.trim(),
          color: payload.color?.trim(),
          weight: payload.weight,
          metarialLoss: payload.metarialLoss,
          makingCost: payload.makingCost,
          colorCount: payload.colorCount,
          productTypeId: payload.productTypeId,
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
          qty: payload.qty,
          collection: payload.collection?.trim(),
          shortDesc: payload.shortDesc?.trim(),
          color: payload.color?.trim(),
          weight: payload.weight,
          metarialLoss: payload.metarialLoss,
          makingCost: payload.makingCost,
          colorCount: payload.colorCount,
          productTypeId: payload.productTypeId,
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
