import { defineStore } from 'pinia'
import type { ImageDto } from '../dtos/ImageDto'
import { API_BASE_URL } from '../config/env'
import { http } from '../services/http'

const BASE_URL = API_BASE_URL + '/images'

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
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        this.items = await http<ImageDto[]>('/images')
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load images'
      } finally {
        this.loading = false
      }
    },

    async upload(file: File) {
      this.loading = true
      this.error = null
      try {
        const fd = new FormData()
        fd.append('file', file) // backend expects "file"

        const created = await http<ImageDto>('/images/upload', {
          method: 'POST',
          body: fd,
        })

        // add to list
        this.items.unshift(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Upload failed'
        throw e
      } finally {
        this.loading = false
      }
    },

    async remove(id: number) {
      this.loading = true
      this.error = null
      try {
        await http<void>(`/images/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((x) => x.id !== id)
      } catch (e: any) {
        this.error = e?.message ?? 'Delete failed'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})