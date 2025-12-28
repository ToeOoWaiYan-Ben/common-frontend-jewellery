// src/stores/useCategoriesStore.ts
import { defineStore } from 'pinia'
import type { CategoryDto } from '../dtos/CategoryDto'
import { http } from '../services/http'

type CategoriesState = {
  items: CategoryDto[]
  loading: boolean
  error: string | null
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalCategories: (s) => s.items.length,
  },

  actions: {
    async loadCategories() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<CategoryDto[]>('/api/categories')
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading categories.'
      } finally {
        this.loading = false
      }
    },

    async createCategory(payload: { name: string; code: string; description?: string }) {
      this.loading = true
      this.error = null
      try {
        const created = await http<CategoryDto>('/api/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.items.push(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while creating category.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateCategory(id: number, payload: { name: string; code: string; description?: string }) {
      this.loading = true
      this.error = null
      try {
        const updated = await http<CategoryDto>(`/api/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        const idx = this.items.findIndex((c) => c.id === id)
        if (idx !== -1) this.items[idx] = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while updating category.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/api/categories/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((c) => c.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while deleting category.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})