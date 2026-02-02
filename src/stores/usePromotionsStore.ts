import { defineStore } from 'pinia'
import type { PromotionDto } from '../dtos/PromotionDto'
import { http } from '../services/http'

interface PromotionsState {
  items: PromotionDto[]
  loading: boolean
  error: string | null
}

export const usePromotionsStore = defineStore('promotions', {
  state: (): PromotionsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadPromotions() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<PromotionDto[]>('/promotions')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load promotions.'
      } finally {
        this.loading = false
      }
    },

    async createPromotion(payload: Omit<PromotionDto, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const body = {
          ...payload,
          name: payload.name?.trim(),
          description: payload.description?.trim() || null,
        }

        const created = await http<PromotionDto>('/promotions', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create promotion.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updatePromotion(
      id: number,
      payload: Omit<PromotionDto, 'id' | 'createdAt' | 'updatedAt'>
    ) {
      this.loading = true
      this.error = null
      try {
        const body = {
          ...payload,
          name: payload.name?.trim(),
          description: payload.description?.trim() || null,
        }

        const updated = await http<PromotionDto>(`/promotions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = updated
        else await this.loadPromotions()

        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update promotion.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deletePromotion(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/promotions/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete promotion.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
