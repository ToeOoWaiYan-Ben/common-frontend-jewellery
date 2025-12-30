import { defineStore } from 'pinia'
import type { UserDto } from '../dtos/UserDto'
import { http } from '../services/http'

interface UsersState {
  items: UserDto[]
  loading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalUsers: (state) => state.items.length,
  },

  actions: {
    async loadUsers() {
      this.loading = true
      this.error = null
      try {
        // ✅ use http() for GET
        this.items = await http<UserDto[]>('/customers')
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading users.'
      } finally {
        this.loading = false
      }
    },
  },
})