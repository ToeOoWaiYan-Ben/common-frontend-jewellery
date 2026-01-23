import { defineStore } from 'pinia'
import { http } from '../services/http'

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
        this.items = await http<GemTypeDto[]>('/gem-types')
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
        const created = await http<GemTypeDto>('/gem-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create gem type.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(id: number, name: string) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/gem-types/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = { id, name: name.trim() }
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update gem type.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/gem-types/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete gem type.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
