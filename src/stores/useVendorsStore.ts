import { defineStore } from 'pinia'
import type { VendorDto } from '../dtos/VendorDto'
import { http } from '../services/http'

interface VendorsState {
  items: VendorDto[]
  loading: boolean
  error: string | null
}

export const useVendorsStore = defineStore('vendors', {
  state: (): VendorsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalVendors: (state) => state.items.length,
  },

  actions: {
    async loadVendors() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<VendorDto[]>('/vendors')
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading vendors.'
      } finally {
        this.loading = false
      }
    },

    async createVendor(payload: Omit<VendorDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const created = await http<VendorDto>('/vendors', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while creating vendor.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateVendor(id: number, payload: Omit<VendorDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<VendorDto>(`/vendors/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const idx = this.items.findIndex((v) => v.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while updating vendor.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteVendor(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/vendors/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((v) => v.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting vendor.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
