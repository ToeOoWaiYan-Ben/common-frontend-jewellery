import { defineStore } from 'pinia'
import type { SellerDto } from '../dtos/SellerDto'

const BASE_URL = 'http://localhost:8080/api/sellers'

export const useSellersStore = defineStore('sellers', {
  state: () => ({
    items: [] as SellerDto[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`Failed to fetch sellers (${res.status})`)
        this.items = (await res.json()) as SellerDto[]
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load sellers.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<SellerDto, 'id'>) {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text().catch(() => ''))
      this.items.push((await res.json()) as SellerDto)
    },

    async update(id: number, payload: Omit<SellerDto, 'id'>) {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text().catch(() => ''))
      const updated = (await res.json()) as SellerDto
      const idx = this.items.findIndex((x) => x.id === id)
      if (idx !== -1) this.items[idx] = updated
    },

    async remove(id: number) {
      const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text().catch(() => ''))
      this.items = this.items.filter((x) => x.id !== id)
    },
  },
})
