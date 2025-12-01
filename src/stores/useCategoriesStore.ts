// src/stores/useCategoriesStore.ts
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
        if (!res.ok) {
          throw new Error(`Failed to fetch categories (${res.status})`)
        }

        this.items = (await res.json()) as CategoryDto[]
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while loading categories.'
      } finally {
        this.loading = false
      }
    },

    // CREATE
    async createCategory(payload: {
      name: string
      code: string
      description?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('http://localhost:8080/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          throw new Error(`Failed to create category (${res.status})`)
        }

        const created = (await res.json()) as CategoryDto
        this.items.push(created)
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while creating category.'
        throw e
      } finally {
        this.loading = false
      }
    },

    // UPDATE
    async updateCategory(
      id: number,
      payload: { name: string; code: string; description?: string }
    ) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          throw new Error(`Failed to update category (${res.status})`)
        }

        const updated = (await res.json()) as CategoryDto

        // update item in local list
        const idx = this.items.findIndex((c) => c.id === id)
        if (idx !== -1) {
          this.items[idx] = updated
        }
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while updating category.'
        throw e
      } finally {
        this.loading = false
      }
    },

    // DELETE
    async deleteCategory(id: number) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
          method: 'DELETE'
        })

        if (!res.ok) {
          throw new Error(`Failed to delete category (${res.status})`)
        }

        this.items = this.items.filter((c) => c.id !== id)
      } catch (e: any) {
        this.error =
          e?.message ?? 'Something went wrong while deleting category.'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
