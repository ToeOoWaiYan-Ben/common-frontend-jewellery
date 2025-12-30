// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import { loginApi } from '../services/authApi'
import type { LoginRequestDto } from '../dtos/auth/LoginDto'

type AuthState = {
  token: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
  },

  actions: {
    async login(payload: LoginRequestDto) {
      this.loading = true
      this.error = null
      this.token = null
      localStorage.removeItem('token')

      try {
        const data = await loginApi(payload)
        const token = (data as any).accessToken ?? (data as any).token
        if (!token) throw new Error('No token returned from server')

        this.token = token
        localStorage.setItem('token', token)

        return data
      } catch (e: any) {
        this.error = e?.message || 'Login failed'
        throw e
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      localStorage.removeItem('token')
    },
  },
})
