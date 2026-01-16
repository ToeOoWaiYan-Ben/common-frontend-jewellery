// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import { loginApi } from '../services/authApi'
import type { LoginRequestDto } from '../dtos/auth/LoginDto'

type AuthUser = {
  name: string
  role?: string | null
  email?: string | null
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    userName: (s) => s.user?.name ?? 'Admin',
    userRole: (s) => s.user?.role ?? 'Administrator',
  },

  actions: {
    async login(payload: LoginRequestDto) {
      this.loading = true
      this.error = null
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      try {
        const data = await loginApi(payload)

        const token = (data as any).accessToken ?? (data as any).token
        if (!token) throw new Error('No token returned from server')

        // ✅ get name/role/email from response (adjust keys to your backend)
        const name = (data as any).name ?? (data as any).user?.name
        const role = (data as any).role ?? (data as any).user?.role
        const email = (data as any).email ?? (data as any).user?.email

        if (!name) {
          // If your backend doesn't send name yet, you must add it OR call /me endpoint
          throw new Error('No user name returned from server')
        }

        this.token = token
        this.user = { name, role: role ?? null, email: email ?? null }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(this.user))

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
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})