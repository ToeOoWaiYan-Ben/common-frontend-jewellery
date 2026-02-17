// src/stores/useUserJewelryTypesStore.ts
import { defineStore } from 'pinia'
import { http } from '@/services/http'

export type JewelryTypeDto = {
  id: number
  name: string
  categoryId: number | null
  categoryName?: string | null
  imageUrl?: string | null
  description?: string | null // ✅ add if backend has it (safe even if null)
}

interface State {
  items: JewelryTypeDto[]
  activeType: JewelryTypeDto | null
  loading: boolean
  error: string | null
}

export const useUserJewelryTypesStore = defineStore('userJewelryTypes', {
  state: (): State => ({
    items: [],
    activeType: null,
    loading: false,
    error: null,
  }),

  getters: {
    // optional helper: easy grouping in header
    groupedByCategory: (state) => {
      const map: Record<string, JewelryTypeDto[]> = {}
      for (const t of state.items) {
        const key = t.categoryName || 'Other'
        if (!map[key]) map[key] = []
        map[key].push(t)
      }
      Object.keys(map).forEach((k) => {
        map[k].sort((a, b) => a.name.localeCompare(b.name))
      })
      return map
    },
  },

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<JewelryTypeDto[]>('/jewelry-types') // ✅ GET
        // ✅ set default active type (optional)
        if (!this.activeType && this.items.length > 0) {
          this.activeType = this.items[0]
        }
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load jewelry types'
      } finally {
        this.loading = false
      }
    },

    setActiveType(typeId: number) {
      const found = this.items.find((t) => t.id === typeId) ?? null
      this.activeType = found
    },

    clearActiveType() {
      this.activeType = null
    },
  },
})
