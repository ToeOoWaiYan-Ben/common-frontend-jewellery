import { defineStore } from 'pinia'
import { http } from '../services/http'
import type { VendorDto } from '../dtos/VendorDto'

interface VendorInvoiceLookupItemDto {
  purchaseItemId: number
  productId: number
  productName: string
  qty: number
  sellingPrice: number
  finalPrice: number
}

interface VendorInvoiceLookupDto {
  invoiceId: number
  invoiceNo: string
  customerId: number
  customerName: string
  customerPhone: string
  items: VendorInvoiceLookupItemDto[]
}

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
        const raw = await http<VendorDto[]>('/vendors')
        this.items = raw ?? []
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading vendors.'
      } finally {
        this.loading = false
      }
    },

    async getVendorById(id: number) {
      this.loading = true
      this.error = null

      try {
        return await http<VendorDto>(`/vendors/${id}`)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading vendor.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async searchInvoice(invoiceNo: string) {
      this.loading = true
      this.error = null

      try {
        const raw = await http<VendorInvoiceLookupDto>(
          `/vendors/invoice/${encodeURIComponent(invoiceNo)}`
        )
        return raw
      } catch (e: any) {
        this.error = e?.message ?? 'Invoice not found.'
        throw e
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
    
        await this.loadVendors()   // ✅ reload fresh data from backend
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
    
        await this.loadVendors()   // ✅ reload fresh data
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
        await http<void>(`/vendors/${id}`, {
          method: 'DELETE',
        })
    
        await this.loadVendors()   // ✅ reload fresh data
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting vendor.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})