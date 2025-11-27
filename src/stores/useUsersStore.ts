// src/stores/useUsersStore.ts
import { defineStore } from 'pinia'
import type { UserDto } from '@/dtos/UserDto'

interface UsersState {
  items: UserDto[]
  loading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalUsers: (state) => state.items.length
  },

  actions: {
    async loadUsers() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch('http://localhost:8080/api/customers')
        if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`)

       this.items= (await res.json()) as UserDto[]

      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading users.'
      } finally {
        this.loading = false
      }
    }
  }
})
