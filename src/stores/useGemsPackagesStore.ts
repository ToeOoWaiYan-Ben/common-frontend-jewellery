import { defineStore } from 'pinia'
import type { GemsPackageDto } from '../dtos/GemsPackageDto'
import { http } from '../services/http'

interface State {
  items: GemsPackageDto[]
  loading: boolean
  error: string | null
}

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
        this.items = await http<GemsPackageDto[]>('/gems-packages')
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

        const created = await http<GemsPackageDto>('/gems-packages', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        this.items.push(created)
        return created
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
          gemTypeId: payload.gemTypeId,
          sellerName: payload.sellerName?.trim(),
        }

        // If backend returns JSON:
        // const updated = await http<GemsPackageDto>(`/gems-packages/${id}`, { method:'PUT', body: JSON.stringify(body) })

        // If backend returns 204:
        await http<void>(`/gems-packages/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx === -1) {
          await this.loadAll()
          return
        }

        this.items[idx] = { id, ...body } as any
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
        await http<void>(`/gems-packages/${id}`, { method: 'DELETE' })
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
