import { defineStore } from 'pinia'
import type { GemsPackageDto } from '../dtos/GemsPackageDto'

interface State {
  items: GemsPackageDto[]
  loading: boolean
  error: string | null
}

const BASE_URL = 'http://localhost:8080/api/gems-packages'

export const useGemsPackagesStore = defineStore('gemsPackages', {
  state: (): State => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`Failed to fetch gems packages (${res.status})`)
        this.items = (await res.json()) as GemsPackageDto[]
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load gems packages.'
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<GemsPackageDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const body = {
          ...payload,
          name: payload.name?.trim(),
          color: payload.color?.trim(),
          cutting: payload.cutting?.trim(),
          description: payload.description?.trim(),
          gemTypeId: payload.gemTypeId,
          sellerName: payload.sellerName?.trim(),
        }

        console.log('DEBUG CREATE body=', body)

        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to create (${res.status}) ${msg}`)
        }

        const created = (await res.json()) as GemsPackageDto
        this.items.push(created)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to create.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(id: number, payload: Omit<GemsPackageDto, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const body = {
          ...payload,
          name: payload.name?.trim(),
          color: payload.color?.trim(),
          cutting: payload.cutting?.trim(),
          description: payload.description?.trim(),
          gemTypeId: payload.gemTypeId, // ✅ IMPORTANT
          sellerName: payload.sellerName?.trim(),
        }

        console.log('DEBUG UPDATE body=', body)

        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(`Failed to update (${res.status}) ${msg}`)
        }

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx === -1) {
          await this.loadAll()
          return
        }

        const contentType = res.headers.get('content-type') || ''
        if (res.status === 204 || !contentType.includes('application/json')) {
          this.items[idx] = { id, ...body } as any
        } else {
          this.items[idx] = (await res.json()) as GemsPackageDto
        }
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`Failed to delete (${res.status})`)
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete.'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
