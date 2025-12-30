import { defineStore } from 'pinia'
import { API_BASE_URL } from '../config/env'
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

const BASE_URL = API_BASE_URL + '/gem-types'

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
        // ✅ use http() for GET like Categories example
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
        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })

        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to create gem type (${res.status})`)

        const created = JSON.parse(raw) as GemTypeDto
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
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })

        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to update gem type (${res.status})`)

        const updated = raw ? (JSON.parse(raw) as GemTypeDto) : ({ id, name } as GemTypeDto)

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) this.items[idx] = updated
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
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to delete gem type (${res.status})`)
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
