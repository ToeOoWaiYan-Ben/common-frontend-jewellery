// src/stores/useCustomersStore.ts
import { defineStore } from 'pinia'
import type { CustomerDto } from '../dtos/CustomerDto'

interface CustomersState {
  items: CustomerDto[]
  loading: boolean
  error: string | null
}

const API_BASE = 'http://localhost:8080/api/customers'

export const useCustomersStore = defineStore('customers', {
  state: (): CustomersState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalCustomers: (state) => state.items.length
  },

  actions: {
    async loadCustomers() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error(`Failed to fetch customers (${res.status})`)
        this.items = (await res.json()) as CustomerDto[]
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while loading customers.'
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
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const msg = await safeReadError(res)
          throw new Error(msg || `Failed to create customer (${res.status})`)
        }

        const created = (await res.json()) as CustomerDto
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while creating customer.'
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
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const msg = await safeReadError(res)
          throw new Error(msg || `Failed to update customer (${res.status})`)
        }

        const updated = (await res.json()) as CustomerDto
        const idx = this.items.findIndex((c) => c.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while updating customer.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCustomer(id: number) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE'
        })

        if (!res.ok) {
          const msg = await safeReadError(res)
          throw new Error(msg || `Failed to delete customer (${res.status})`)
        }

        this.items = this.items.filter((c) => c.id !== id)
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while deleting customer.'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})

async function safeReadError(res: Response) {
  try {
    const text = await res.text()
    return text?.trim()
  } catch {
    return ''
  }
}