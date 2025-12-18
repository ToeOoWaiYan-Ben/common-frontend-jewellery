import { defineStore } from 'pinia'
import type { CraftDto } from '../dtos/CraftDto'

interface CraftsState {
  items: CraftDto[]
  loading: boolean
  error: string | null
}

const API = 'http://localhost:8080/api/crafts'

async function readErrorBody(res: Response) {
  try {
    const text = await res.text()
    return text || res.statusText
  } catch {
    return res.statusText
  }
}

export const useCraftsStore = defineStore('crafts', {
  state: (): CraftsState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalCrafts: (s) => s.items.length
  },

  actions: {
    async loadCrafts() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(API)
        if (!res.ok) {
          const detail = await readErrorBody(res)
          throw new Error(`Failed to fetch crafts (${res.status}): ${detail}`)
        }
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
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const detail = await readErrorBody(res)
          throw new Error(`Failed to create craft (${res.status}): ${detail}`)
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
        const res = await fetch(`${API}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const detail = await readErrorBody(res)
          throw new Error(`Failed to update craft (${res.status}): ${detail}`)
        }

        const updated = (await res.json()) as CraftDto
        const idx = this.items.findIndex((x) => x.id === id)
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
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' })

        if (!res.ok) {
          const detail = await readErrorBody(res)
          throw new Error(`Failed to delete craft (${res.status}): ${detail}`)
        }

        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting craft.'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
