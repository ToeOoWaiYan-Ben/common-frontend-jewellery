import { defineStore } from 'pinia'
import type { CraftDto } from '../dtos/CraftDto'
import { API_BASE_URL } from '../config/env'
import { http } from '../services/http'

interface CraftsState {
  items: CraftDto[]
  loading: boolean
  error: string | null
}

const BASE_URL = API_BASE_URL + '/crafts'

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
        // ✅ use http() for GET
        const raw = await http<CraftApi[]>('/crafts')
        this.items = raw.map(mapToCraftDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading crafts.'
      } finally {
        this.loading = false
      }
    },

    async createCraft(payload: Omit<CraftDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const body = {
          shopName: payload.shopName?.trim(),
          nrc: payload.nrc?.trim(),
          phone: payload.phone?.trim(),
          address: payload.address?.trim(),
        }

        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to create craft (${res.status})`)

        const createdRaw = JSON.parse(raw) as CraftApi
        const created = mapToCraftDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while creating craft.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCraft(id: number, payload: Omit<CraftDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopName: payload.shopName?.trim(),
            nrc: payload.nrc?.trim(),
            phone: payload.phone?.trim(),
            address: payload.address?.trim(),
          }),
        })

        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to update craft (${res.status})`)

        const idx = this.items.findIndex((c) => c.id === id)
        if (idx === -1) {
          await this.loadCrafts()
          return
        }

        if (!raw) {
          this.items[idx] = { id, ...payload }
        } else {
          const updatedRaw = JSON.parse(raw) as CraftApi
          this.items[idx] = mapToCraftDto(updatedRaw)
        }
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while updating craft.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCraft(id: number) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to delete craft (${res.status})`)
        this.items = this.items.filter((c) => c.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting craft.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})