// src/stores/useCraftsStore.ts
import { defineStore } from 'pinia'
import type { CraftDto } from '../dtos/CraftDto'
import { http } from '../services/http'

interface CraftsState {
  items: CraftDto[]
  loading: boolean
  error: string | null // ✅ ONLY for loadCrafts()
}

type CraftApi = {
  id: number
  shopName?: string | null
  shop_name?: string | null
  shop_Name?: string | null
  nrc?: string | null
  phone?: string | null
  address?: string | null
}

function mapToCraftDto(x: CraftApi): CraftDto {
  return {
    id: x.id,
    shopName: (x.shopName ?? x.shop_name ?? x.shop_Name ?? '') as string,
    nrc: (x.nrc ?? '') as string,
    phone: (x.phone ?? '') as string,
    address: (x.address ?? '') as string,
  }
}

export const useCraftsStore = defineStore('crafts', {
  state: (): CraftsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalCrafts: (state) => state.items.length,
  },

  actions: {
    async loadCrafts() {
      this.loading = true
      this.error = null
      try {
        const raw = await http<CraftApi[]>('/crafts')
        this.items = raw.map(mapToCraftDto)
      } catch (e: any) {
        // ✅ Only load error goes here (list panel error)
        this.error = e?.message ?? 'Something went wrong while loading crafts.'
      } finally {
        this.loading = false
      }
    },

    async createCraft(payload: Omit<CraftDto, 'id'>) {
      this.loading = true
      // ❌ do NOT clear this.error here (keep list visible)
      try {
        const body = {
          shopName: payload.shopName?.trim(),
          nrc: payload.nrc?.trim(),
          phone: payload.phone?.trim(),
          address: payload.address?.trim(),
        }

        const createdRaw = await http<CraftApi>('/crafts', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToCraftDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        // ✅ let the view show formError (do not touch store.error)
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCraft(id: number, payload: Omit<CraftDto, 'id'>) {
      this.loading = true
      // ❌ do NOT clear this.error here
      try {
        const body = {
          shopName: payload.shopName?.trim(),
          nrc: payload.nrc?.trim(),
          phone: payload.phone?.trim(),
          address: payload.address?.trim(),
        }

        const updatedRaw = await http<CraftApi>(`/crafts/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToCraftDto(updatedRaw)

        const idx = this.items.findIndex((c) => c.id === id)
        if (idx === -1) {
          await this.loadCrafts()
          return
        }

        this.items[idx] = updated
      } catch (e: any) {
        // ✅ view handles it (formError), list stays
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCraft(id: number) {
      this.loading = true
      // ❌ do NOT clear this.error here
      try {
        await http<void>(`/crafts/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((c) => c.id !== id)
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
