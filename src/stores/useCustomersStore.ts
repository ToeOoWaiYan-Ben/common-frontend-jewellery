// src/stores/useCustomersStore.ts
import { defineStore } from 'pinia'
import type { CustomerDto } from '../dtos/CustomerDto'
import { http } from '../services/http'

type CustomersState = {
  items: CustomerDto[]
  loading: boolean
  error: string | null
}

export const useCustomersStore = defineStore('customers', {
  state: (): CustomersState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalCustomers: (s) => s.items.length,
  },

  actions: {
    async loadCustomers() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<CustomerDto[]>('/api/customers')
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading customers.'
      } finally {
        this.loading = false
      }
    },

    async createCustomer(payload: {
      name: string
      phone: string
      address: string
      role: string
      password: string
      gmail?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const created = await http<CustomerDto>('/api/customers', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while creating customer.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCustomer(
      id: number,
      payload: {
        name?: string
        phone?: string
        address?: string
        role?: string
        password?: string
        gmail?: string
      }
    ) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<CustomerDto>(`/api/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const idx = this.items.findIndex((c) => c.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while updating customer.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCustomer(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/api/customers/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((c) => c.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting customer.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
