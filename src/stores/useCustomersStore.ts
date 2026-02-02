import { defineStore } from 'pinia'
import type { CustomerDto } from '../dtos/CustomerDto'
import { http } from '../services/http'

interface CustomersState {
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

  actions: {
    async loadCustomers() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<CustomerDto[]>('/customers')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load customers.'
      } finally {
        this.loading = false
      }
    },

    async createCustomer(payload: Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const created = await http<CustomerDto>('/customers', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create customer.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCustomer(id: number, payload: Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<CustomerDto>(`/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update customer.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCustomer(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/customers/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete customer.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
