import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { GoldSourceDto } from '../dtos/GoldSourceDto'

interface GoldSourceState {
  items: GoldSourceDto[]
  loading: boolean
  error: string | null
}

type GoldSourceApi = {
  id: number
  goldPurity?: string | null
  gold_purity?: string | null
  weight?: number | null
  color?: string | null
  sourceCountry?: string | null
  source_country?: string | null
  originalPrice?: number | null
  original_price?: number | null
  sellerId?: number | null
  seller_id?: number | null
  name?: string | null
}

function mapToGoldSourceDto(x: GoldSourceApi): GoldSourceDto {
  return {
    id: x.id,
    goldPurity: (x.goldPurity ?? x.gold_purity ?? '') as string,
    weight: Number(x.weight ?? 0),
    color: (x.color ?? '') as string,
    sourceCountry: (x.sourceCountry ?? x.source_country ?? '') as string,
    originalPrice: Number(x.originalPrice ?? x.original_price ?? 0),
    sellerId: (x.sellerId ?? x.seller_id ?? null) as number | null,
    name: (x.name ?? '') as string,
  }
}

export const useGoldSourceStore = defineStore('goldSource', {
  state: (): GoldSourceState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalGoldSources: (s) => s.items.length,
  },

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        const raw = await http<GoldSourceApi[]>('/gold-source')
        this.items = raw.map(mapToGoldSourceDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load gold sources.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<GoldSourceDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const body = {
          goldPurity: payload.goldPurity?.trim(),
          weight: Number(payload.weight ?? 0),
          color: payload.color?.trim(),
          sourceCountry: payload.sourceCountry?.trim(),
          originalPrice: Number(payload.originalPrice ?? 0),
          sellerId: payload.sellerId ?? null,
          name: payload.name?.trim(),
        }

        const createdRaw = await http<GoldSourceApi>('/gold-source', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToGoldSourceDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create gold source.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(id: number, payload: Omit<GoldSourceDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const body = {
          goldPurity: payload.goldPurity?.trim(),
          weight: Number(payload.weight ?? 0),
          color: payload.color?.trim(),
          sourceCountry: payload.sourceCountry?.trim(),
          originalPrice: Number(payload.originalPrice ?? 0),
          sellerId: payload.sellerId ?? null,
          name: payload.name?.trim(),
        }

        const updatedRaw = await http<GoldSourceApi>(`/gold-source/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToGoldSourceDto(updatedRaw)
        const idx = this.items.findIndex((x) => x.id === id)
        if (idx === -1) {
          await this.loadAll()
          return
        }
        this.items[idx] = updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update gold source.'
        throw e
      } finally {
        this.loading = false
      }
    },

    // ✅ FIXED DELETE (only change you need)
    async delete(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/gold-source/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        // read backend message safely (without touching http.ts)
        const msg =
          e?.data?.message ||
          e?.data?.error ||
          e?.data?.detail ||
          e?.message ||
          'Cannot delete: this gold source is referenced by product_gold. Delete related records first.'

        this.error = msg
        throw new Error(msg) // so your UI alert shows the clean message
      } finally {
        this.loading = false
      }
    },
  },
})
