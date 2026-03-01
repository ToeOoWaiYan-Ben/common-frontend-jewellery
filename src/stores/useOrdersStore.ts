import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { OrderDto } from '../dtos/OrderDto'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async createOrder(payload: OrderDto, allowBackorder = true) {
      this.loading = true
      this.error = null
      try {
        return await http<OrderDto>(`/orders?allowBackorder=${allowBackorder}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create order'
        throw e
      } finally {
        this.loading = false
      }
    },

    async getOrderById(id: number) {
      return await http<OrderDto>(`/orders/${Number(id)}`)
    },
  },
})