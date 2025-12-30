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
      console.log("here is the function payload-->",payload)
      try {
        const data = await loginApi(payload)

        // assumes backend returns { token: "..." }
        this.token = data.token
        localStorage.setItem('token', data.token)

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
