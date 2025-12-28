import { defineStore } from 'pinia'
import type { CraftDto } from '../dtos/CraftDto'

interface CraftsState {
  items: CraftDto[]
  loading: boolean
  error: string | null
}

const BASE_URL = 'http://localhost:8080/api/crafts'

// Backend might return any of these keys for shop name.
// We normalize them to CraftDto.shopName.
type CraftApi = {
  id: number
  shopName?: string | null
  shop_name?: string | null
  shop_Name?: string | null
  nrc?: string | null
  phone?: string | null
  address?: string | null
}

// Convert backend object -> frontend CraftDto
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
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`Failed to fetch crafts (${res.status})`)

        const raw = (await res.json()) as CraftApi[]
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

        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to create craft (${res.status}) ${msg}`)
        }

        const created = (await res.json()) as CraftDto
        this.items.push(created)
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
            shopName: payload.shopName,
            nrc: payload.nrc,
            phone: payload.phone,
            address: payload.address,
          }),
        })

        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to update craft (${res.status}) ${msg}`)
        }

        const idx = this.items.findIndex((c) => c.id === id)
        if (idx === -1) {
          await this.loadCrafts()
          return
        }

        // ✅ handle both JSON response and empty response (204)
        const contentType = res.headers.get('content-type') || ''

        if (res.status === 204 || !contentType.includes('application/json')) {
          // backend returned no body → update locally
          this.items[idx] = { id, ...payload }
        } else {
          const updatedRaw = (await res.json()) as CraftApi
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

        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to delete craft (${res.status}) ${msg}`)
        }

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
