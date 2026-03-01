import { defineStore } from 'pinia'
import { http } from '@/services/http'
import type { InvoiceResponseDto, PurchaseSaveRequestDto } from '@/dtos/InvoiceDto'

interface State {
  items: InvoiceResponseDto[]
  loading: boolean
  error: string | null
}

export const useInvoicesStore = defineStore('invoices', {
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
        this.items = await http<InvoiceResponseDto[]>('/invoices')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load purchases.'
      } finally {
        this.loading = false
      }
    },

    async createInvoice(payload: PurchaseSaveRequestDto) {
      this.loading = true
      this.error = null
      try {
        const created = await http<InvoiceResponseDto>('/invoices', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.unshift(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create invoice.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteOne(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/invoices/${id}`, { method: 'DELETE' })
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
