import { defineStore } from 'pinia'
import type { SellerDto } from '../dtos/SellerDto'
import { http } from '../services/http'

export const useSellersStore = defineStore('sellers', {
  state: () => ({
    items: [] as SellerDto[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<SellerDto[]>('/sellers')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load sellers.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<SellerDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const created = await http<SellerDto>('/sellers', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create seller.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(id: number, payload: Omit<SellerDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/sellers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = { id, ...payload } as any
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update seller.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/sellers/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete seller.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
