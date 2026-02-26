import { defineStore } from 'pinia'
import type { ImageDto } from '../dtos/ImageDto'
import { http } from '../services/http'

interface ImagesState {
  items: ImageDto[]
  loading: boolean
  error: string | null
}

export const useImagesStore = defineStore('images', {
  state: (): ImagesState => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    /* ===============================
       LOAD ALL IMAGES
    =============================== */
    async loadAll() {
      this.loading = true
      this.error = null

      try {
        const data = await http<ImageDto[]>('/images')
        this.items = data
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load images.'
      } finally {
        this.loading = false
      }
    },

    /* ===============================
       UPLOAD IMAGE (MULTIPART)
    =============================== */
    async upload(file: File): Promise<ImageDto> {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('file', file)

        const created = await http<ImageDto>('/images/upload', {
          method: 'POST',
          body: formData,
          // ❗ DO NOT manually set Content-Type
        })

        // Add new image to beginning of list
        this.items.unshift(created)

        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Upload failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    /* ===============================
       DELETE IMAGE
    =============================== */
    async remove(id: number) {
      this.loading = true
      this.error = null

      try {
        await http<void>(`/images/${id}`, {
          method: 'DELETE',
        })

        this.items = this.items.filter((img) => img.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Delete failed.'
        throw e
      } finally {
        this.loading = false
      }
    },

    /* ===============================
       RESET STORE (optional helper)
    =============================== */
    reset() {
      this.items = []
      this.loading = false
      this.error = null
    },
  },
})
