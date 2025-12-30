// src/stores/useUsersStore.ts
import { defineStore } from 'pinia'
import type { UserDto } from '../dtos/UserDto'
import { API_BASE_URL } from '../config/env'
const BASE_URL = API_BASE_URL + '/customers'
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
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`)

        this.items = (await res.json()) as UserDto[]
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading users.'
      } finally {
        this.loading = false
      }
    },
  },
})
