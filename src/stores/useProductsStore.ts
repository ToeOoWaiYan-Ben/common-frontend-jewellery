import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { ProductDto, ProductGoldItemDto, ProductJewelleryItemDto } from '../dtos/ProductDto'

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
  depreciation?: number | null
  productTypeId?: number | null
  product_type_id?: number | null

  productGolds?: any[] | null
  productJewellerys?: any[] | null
}

function mapToProductDto(x: ProductApi): ProductDto {
  return {
    id: Number(x.id),
    name: (x.name ?? '') as string,
    code: (x.code ?? '') as string,
    stockStatus: (x.stockStatus ?? x.stock_status ?? '') as string,
    desc: (x.desc ?? '') as string,
    qty: Number(x.qty ?? 0),
    collection: (x.collection ?? '') as string,
    shortDesc: (x.shortDesc ?? x.short_desc ?? '') as string,
    color: (x.color ?? '') as string,
    weight: Number(x.weight ?? 0),
    metarialLoss: Number(x.metarialLoss ?? x.metarial_loss ?? 0),
    makingCost: Number(x.makingCost ?? x.making_cost ?? 0),
    colorCount: Number(x.colorCount ?? x.color_count ?? 0),
    depreciation: Number(x.depreciation ?? 0),
    productTypeId: Number(x.productTypeId ?? x.product_type_id ?? 0),

    productGolds: (x.productGolds ?? []).map((g: any) => ({
      id: g.id,
      goldSourceId: Number(g.goldSourceId ?? 0),
      craftId: Number(g.craftId ?? 0),
      weight: Number(g.weight ?? 0),
      goldPurity: (g.goldPurity ?? '') as string,
      goldSourceName: g.goldSourceName ?? '',
      craftShopName: g.craftShopName ?? '',
    })),

    productJewellerys: (x.productJewellerys ?? []).map((j: any) => ({
      id: j.id,
      gemsPackageId: Number(j.gemsPackageId ?? 0),
      qty: Number(j.qty ?? 0),
      sellingPrice: Number(j.sellingPrice ?? 0),
      gemsPackageName: j.gemsPackageName ?? '',
      originalPrice: Number(j.originalPrice ?? 0),
      unitWeight: Number(j.unitWeight ?? 0),
    })),
  }
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [] as ProductDto[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadProducts() {
      this.loading = true
      this.error = null
      try {
        const raw = await http<ProductApi[]>('/products')
        this.items = (raw ?? []).map(mapToProductDto)
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
          qty: Number(payload.qty ?? 0),
          collection: payload.collection?.trim(),
          shortDesc: payload.shortDesc?.trim(),
          color: payload.color?.trim(),
          weight: Number(payload.weight ?? 0),
          metarialLoss: Number(payload.metarialLoss ?? 0),
          makingCost: Number(payload.makingCost ?? 0),
          colorCount: Number(payload.colorCount ?? 0),
          depreciation: Number(payload.depreciation ?? 0),
          productTypeId: Number(payload.productTypeId ?? 0),

          // ✅ send your UI sections as backend expects
          productGolds: (payload.productGolds ?? []).map((g: ProductGoldItemDto) => ({
            goldSourceId: g.goldSourceId,
            craftId: g.craftId,
            weight: Number(g.weight ?? 0),
            goldPurity: g.goldPurity ?? '',
          })),

          productJewellerys: (payload.productJewellerys ?? []).map((j: ProductJewelleryItemDto) => ({
            gemsPackageId: j.gemsPackageId,
            qty: Number(j.qty ?? 0),
            sellingPrice: Number(j.sellingPrice ?? 0),
          })),
        }

        const createdRaw = await http<ProductApi>('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToProductDto(createdRaw)

        // ✅ update list immediately (so ProductListView shows it)
        this.items.unshift(created)

        return created
      } finally {
        this.loading = false
      }
    },
  },
})
