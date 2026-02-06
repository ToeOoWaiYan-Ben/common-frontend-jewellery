import { defineStore } from 'pinia'
import type { GoldPriceHistoryDto } from '../dtos/GoldPriceHistoryDto'
import { http } from '../services/http'

interface State {
  items: GoldPriceHistoryDto[]
  loading: boolean
  error: string | null
}

export const useGoldPriceHistoryStore = defineStore('goldPriceHistory', {
  state: (): State => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<GoldPriceHistoryDto[]>('/gold-price-history')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load gold price history.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<GoldPriceHistoryDto, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const created = await http<GoldPriceHistoryDto>('/gold-price-history', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create gold price record.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(id: number, payload: Omit<GoldPriceHistoryDto, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<GoldPriceHistoryDto>(`/gold-price-history/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update gold price record.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/gold-price-history/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete gold price record.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
