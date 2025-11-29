import { defineStore } from 'pinia'
import type { CategoryDto } from '../dtos/CategoryDto'

interface CategoriesState {
  items: CategoryDto[]
  loading: boolean
  error: string | null
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalCategories: (state) => state.items.length
  },

  actions: {
    async loadCategories() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('http://localhost:8080/api/categories')
        if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)

        this.items = (await res.json()) as CategoryDto[]

      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading categories.'
      } finally {
        this.loading = false
      }
    }
  }
})