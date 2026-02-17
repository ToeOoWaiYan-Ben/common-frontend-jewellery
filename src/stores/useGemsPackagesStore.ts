// src/stores/useGemsPackagesStore.ts
import { defineStore } from 'pinia'
import type { GemsPackageDto } from '../dtos/GemsPackageDto'
import type { ImageDto } from '@/dtos/ImageDto'
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
    /* =========================
       LOAD ALL
    ========================= */
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

    async loadAvailable() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<GemsPackageDto[]>('/gems-packages/available')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load available packages.'
      } finally {
        this.loading = false
      }
    },

    /* =========================
       CREATE
    ========================= */
    async create(payload: Omit<GemsPackageDto, 'id'>) {
      this.loading = true
      this.error = null

      try {
        const { certificateImages: _certificateImages, ...rest } = payload

        const body = {
          ...rest,
          name: payload.name?.trim(),
          color: payload.color?.trim(),
          cutting: payload.cutting?.trim(),
          description: payload.description?.trim(),
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

    /* =========================
       UPDATE
    ========================= */
    async update(id: number, payload: Omit<GemsPackageDto, 'id'>) {
      this.loading = true
      this.error = null

      try {
        const { certificateImages: _certificateImages, ...rest } = payload

        const body = {
          ...rest,
          name: payload.name?.trim(),
          color: payload.color?.trim(),
          cutting: payload.cutting?.trim(),
          description: payload.description?.trim(),
          sellerName: payload.sellerName?.trim(),
        }

        const updated = await http<GemsPackageDto>(`/gems-packages/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const idx = this.items.findIndex((x) => x.id === id)
        if (idx !== -1) {
          this.items[idx] = updated
        } else {
          await this.loadAll()
        }

        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update.'
        throw e
      } finally {
        this.loading = false
      }
    },

    /* =========================
       IMAGE UPLOAD (S3)
    ========================= */
    async uploadToS3(file: File): Promise<string> {
      const fd = new FormData()
      fd.append('file', file)

      // ❗ DO NOT include /api here
      const image = await http<ImageDto>('/images/upload', {
        method: 'POST',
        body: fd,
      })

      return image.url
    },

    /* =========================
       DELETE PACKAGE
    ========================= */
    async remove(id: number) {
      this.loading = true
      this.error = null

      try {
        await http<void>(`/gems-packages/${id}`, {
          method: 'DELETE',
        })

        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete package.'
        throw e
      } finally {
        this.loading = false
      }
    },
    

    /* =========================
       ADD CERTIFICATE
    ========================= */
    async addCertificate(
      packageId: number,
      payload: { imageUrl: string; title?: string | null }
    ) {
      this.loading = true
      this.error = null

      try {
        const updated = await http<GemsPackageDto>(
          `/gems-packages/${packageId}/certificates`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        )

        const idx = this.items.findIndex((x) => x.id === packageId)
        if (idx !== -1) this.items[idx] = updated

        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to add certificate.'
        throw e
      } finally {
        this.loading = false
      }
    },

    /* =========================
       DELETE CERTIFICATE
    ========================= */
    async deleteCertificate(certId: number, packageId: number) {
      this.loading = true
      this.error = null

      try {
        await http<void>(`/gems-packages/certificates/${certId}`, {
          method: 'DELETE',
        })

        const idx = this.items.findIndex((x) => x.id === packageId)
        if (idx === -1) return

        const item = this.items[idx]
        if (!item.certificateImages) item.certificateImages = []

        item.certificateImages = item.certificateImages.filter(
          (c) => c.id !== certId
        )
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to delete certificate.'
        throw e
      } finally {
        this.loading = false
      }
    },

    /* =========================
       GET BY ID
    ========================= */
    async getById(id: number) {
      return await http<GemsPackageDto>(`/gems-packages/${id}`)
    },
  },
})