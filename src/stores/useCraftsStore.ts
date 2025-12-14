import { defineStore } from 'pinia'
import type { CraftDto } from '../dtos/CraftDto'

interface CraftsState {
  items: CraftDto[]
  loading: boolean
  error: string | null
}

const BASE_URL = 'http://localhost:8080/api/crafts'

export const useCraftsStore = defineStore('crafts', {
  state: (): CraftsState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalCrafts: (state) => state.items.length
  },

  actions: {
    async loadCrafts() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`Failed to fetch crafts (${res.status})`)
        this.items = (await res.json()) as CraftDto[]
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
        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Failed to create craft (${res.status})`)
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
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(`Failed to update craft (${res.status}) ${msg}`)
    }

    // ✅ handle both JSON response and empty response (204)
    let updated: CraftDto
    const contentType = res.headers.get('content-type') || ''

    if (res.status === 204 || !contentType.includes('application/json')) {
      // backend returned no body → update locally from payload
      updated = { id, ...payload } as CraftDto
    } else {
      updated = (await res.json()) as CraftDto
    }

    const idx = this.items.findIndex((c) => c.id === id)
    if (idx !== -1) this.items[idx] = updated
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

    // ✅ even if backend returns 204, we still remove locally
    this.items = this.items.filter((c) => c.id !== id)
  } catch (e: any) {
    this.error = e?.message ?? 'Something went wrong while deleting craft.'
    throw e
  } finally {
    this.loading = false
  }
}

  }
})
