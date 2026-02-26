import { defineStore } from 'pinia'
import type { JewelryTypeDto } from '../dtos/JewelryTypeDto'
import { http } from '../services/http'

interface JewelryTypesState {
  items: JewelryTypeDto[]
  loading: boolean
  error: string | null
}

type JewelryTypeApi = {
  id: number
  name?: string | null
  categoryId?: number | null
  category_id?: number | null
  categoryName?: string | null
  category_name?: string | null
  description?: string | null
  imageUrl?: string | null
  image_url?: string | null
}

function mapToJewelryTypeDto(x: JewelryTypeApi): JewelryTypeDto {
  return {
    id: x.id,
    name: (x.name ?? '') as string,
    categoryId: (x.categoryId ?? x.category_id ?? null) as number | null,
    categoryName: (x.categoryName ?? x.category_name ?? null) as string | null,
    imageUrl: (x.imageUrl ?? x.image_url ?? null) as string | null,
    description: (x.description ?? null) as string | null,
  }
}

export const useJewelryTypesStore = defineStore('jewelryTypes', {
  state: (): JewelryTypesState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalJewelryTypes: (state) => state.items.length,
  },

  actions: {
    async loadJewelryTypes(categoryId?: number | null) {
      this.loading = true
      this.error = null
      try {
        const qs = categoryId ? `?categoryId=${categoryId}` : ''
        const raw = await http<JewelryTypeApi[]>(`/jewelry-types${qs}`)
        this.items = (raw ?? []).map(mapToJewelryTypeDto)
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong while loading jewelry types.'
      } finally {
        this.loading = false
      }
    },

    async createJewelryType(payload: Omit<JewelryTypeDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          categoryId: payload.categoryId,
          imageUrl: payload.imageUrl ?? null,
          description: payload.description ?? null,
        }

        const createdRaw = await http<JewelryTypeApi>('/jewelry-types', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        const created = mapToJewelryTypeDto(createdRaw)
        this.items.push(created)
        return created
      } finally {
        this.loading = false
      }
    },

    async updateJewelryType(id: number, payload: Omit<JewelryTypeDto, 'id'>) {
      this.loading = true
      try {
        const body = {
          name: payload.name?.trim(),
          categoryId: payload.categoryId,
          imageUrl: payload.imageUrl ?? null,
          description: payload.description ?? null,
        }

        const updatedRaw = await http<JewelryTypeApi>(`/jewelry-types/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        const updated = mapToJewelryTypeDto(updatedRaw)

        const idx = this.items.findIndex((t) => t.id === id)
        if (idx === -1) {
          await this.loadJewelryTypes()
          return
        }

        this.items[idx] = updated
      } finally {
        this.loading = false
      }
    },

    async deleteJewelryType(id: number) {
      this.loading = true
      try {
        await http<void>(`/jewelry-types/${id}`, { method: 'DELETE' })
        this.items = this.items.filter((t) => t.id !== id)
      } finally {
        this.loading = false
      }
    },
  },
})
