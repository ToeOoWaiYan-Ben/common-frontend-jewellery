import { defineStore } from 'pinia'
import { http } from '@/services/http'
import type { PurchaseDto } from '@/dtos/PurchaseDto'

interface PurchasesState {
  items: PurchaseDto[]
  loading: boolean
  error: string | null
}

export const usePurchasesStore = defineStore('purchases', {
  state: (): PurchasesState => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadPurchases() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<PurchaseDto[]>('/purchases')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load purchases.'
      } finally {
        this.loading = false
      }
    },

    async createPurchase(payload: Omit<PurchaseDto, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const created = await http<PurchaseDto>('/purchases', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        // put newest on top
        this.items = [created, ...this.items]
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create purchase.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deletePurchase(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/purchases/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete purchase.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
