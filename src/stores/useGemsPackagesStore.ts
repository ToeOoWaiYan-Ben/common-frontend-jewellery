import { defineStore } from 'pinia'
import type { GemsPackageDto } from '../dtos/GemsPackageDto'
import { API_BASE_URL } from '../config/env'
import { http } from '../services/http'

interface State {
  items: GemsPackageDto[]
  loading: boolean
  error: string | null
}

const BASE_URL = API_BASE_URL + '/gems-packages'

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
        // ✅ use http() for GET like Categories example
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

        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to create gems package (${res.status})`)

        const created = JSON.parse(raw) as GemsPackageDto
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

        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to update gems package (${res.status})`)

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx === -1) {
          await this.loadAll()
          return
        }

        // some backends return updated JSON, some return empty
        if (!raw) {
          this.items[idx] = { id, ...body } as any
        } else {
          this.items[idx] = JSON.parse(raw) as GemsPackageDto
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
        const raw = await res.text()
        if (!res.ok) throw new Error(raw || `Failed to delete gems package (${res.status})`)
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