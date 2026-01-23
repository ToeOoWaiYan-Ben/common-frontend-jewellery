// useUsersStore.ts
import { defineStore } from 'pinia'
import type { UserDto } from '../dtos/UserDto'
import { http } from '../services/http'

interface UsersState {
  items: UserDto[]
  loading: boolean
  error: string | null // ✅ only for loadUsers()
}

type UserApi = {
  id: number
  name: string
  email: string
  nrc?: string | null
  phone?: string | null
  address?: string | null
  role?: string | null
}

function mapToUserDto(x: UserApi): UserDto {
  return {
    id: x.id,
    name: x.name,
    email: x.email,
    password: undefined,
    nrc: x.nrc ?? null,
    phone: x.phone ?? null,
    address: x.address ?? null,
  }
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
        const raw = await http<UserApi[]>('/users')
        this.items = raw.map(mapToUserDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading users.'
      } finally {
        this.loading = false
      }
    },

    async createUser(payload: Omit<UserDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          email: payload.email?.trim(),
          password: payload.password,
          nrc: payload.nrc?.trim() || null,
          phone: payload.phone?.trim() || null,
          address: payload.address?.trim() || null,
        }

        const createdRaw = await http<UserApi>('/users', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToUserDto(createdRaw)
        this.items.push(created)
        return created
      } catch (e: any) {
        // ✅ don’t touch this.error here
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateUser(id: number, payload: Omit<UserDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          email: payload.email?.trim(),
          password: payload.password || null,
          nrc: payload.nrc?.trim() || null,
          phone: payload.phone?.trim() || null,
          address: payload.address?.trim() || null,
        }

        const updatedRaw = await http<UserApi>(`/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToUserDto(updatedRaw)

        const idx = this.items.findIndex((u) => u.id === id)
        if (idx !== -1) this.items[idx] = updated
        else await this.loadUsers()

        return updated
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id: number) {
      this.loading = true
      try {
        await http<void>(`/users/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((u) => u.id !== id)
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
