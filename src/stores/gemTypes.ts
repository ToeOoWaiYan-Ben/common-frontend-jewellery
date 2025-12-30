import { defineStore } from 'pinia'
import { API_BASE_URL } from '../config/env'

export interface GemTypeDto {
  id: number
  name: string
}

interface State {
  items: GemTypeDto[]
  loading: boolean
  error: string | null
}

export const useGemTypesStore = defineStore('gemTypes', {
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
        const res = await fetch(API_BASE_URL)
        if (!res.ok) throw new Error(`Failed to fetch gem types (${res.status})`)
        this.items = (await res.json()) as GemTypeDto[]
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load gem types.'
      } finally {
        this.loading = false
      }
    },

    async create(name: string) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to create (${res.status}) ${msg}`)
        }
        const created = (await res.json()) as GemTypeDto
        this.items.push(created)
      } finally {
        this.loading = false
      }
    },

    async update(id: number, name: string) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to update (${res.status}) ${msg}`)
        }
        const updated = (await res.json()) as GemTypeDto
        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = updated
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to delete (${res.status}) ${msg}`)
        }
        this.items = this.items.filter((x) => x.id !== id)
      } finally {
        this.loading = false
      }
    },
  },
})
