import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { OrderDto } from '../dtos/OrderDto'

interface OrdersState {
  items: OrderDto[]
  loading: boolean
  error: string | null
}

export const useOrdersStore = defineStore('orders', {
  state: (): OrdersState => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadOrders() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<OrderDto[]>('/orders')

        // ✅ log first order
        console.log('FIRST ORDER =', this.items?.[0])

        return this.items
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load orders'
        throw e
      } finally {
        this.loading = false
      }
    },

    async createOrder(payload: any, allowBackorder = true) {
      this.loading = true
      this.error = null
      try {
        const created = await http<OrderDto>(`/orders?allowBackorder=${allowBackorder}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        // ✅ update list instantly
        this.items.unshift(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create order'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
