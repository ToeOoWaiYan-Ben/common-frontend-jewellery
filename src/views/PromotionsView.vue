<template>
  <TablePage
    title="Promotions"
    :total="totalPromotions"
    :filteredCount="filteredCount"
    :items="paginatedPromotions"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Promotion'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Promotion' : 'New Promotion' }}
        </h3>

        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <!-- Name -->
        <div class="category-form__row">
          <label class="category-form__label" for="name">Promotion Name *</label>
          <input
            id="name"
            v-model.trim="form.name"
            class="category-form__input"
            type="text"
            required
            placeholder="e.g. Valentine Sale"
          />
        </div>

        <!-- Discount Rate -->
        <div class="category-form__row">
          <label class="category-form__label" for="discountRate">Discount Rate (%) *</label>
          <input
            id="discountRate"
            :value="form.discountRate ?? ''"
            class="category-form__input"
            type="number"
            step="0.01"
            required
            placeholder="e.g. 10"
            @input="form.discountRate = toNumOrNull(($event.target as HTMLInputElement).value)"
          />
        </div>

        

        <!-- Start Date -->
        <div class="category-form__row">
          <label class="category-form__label" for="startDate">Start Date *</label>
          <input
            id="startDate"
            v-model="form.startDate"
            class="category-form__input"
            type="date"
            required
          />
        </div>

        <!-- End Date -->
        <div class="category-form__row">
          <label class="category-form__label" for="endDate">End Date *</label>
          <input
            id="endDate"
            v-model="form.endDate"
            class="category-form__input"
            type="date"
            required
          />
        </div>

        <!-- Description -->
        <div class="category-form__row">
          <label class="category-form__label" for="description">Description</label>
          <textarea
            id="description"
            v-model.trim="form.description"
            rows="4"
            class="category-form__input category-form__textarea"
            placeholder="Optional note…"
          ></textarea>
        </div>

        <div class="category-form__actions">
          <button class="btn-secondary" type="button" @click="resetForm" :disabled="isSubmitting">
            Reset
          </button>

          <button
            v-if="isEditing"
            class="btn-secondary"
            type="button"
            @click="closeEdit"
            :disabled="isSubmitting"
          >
            Close
          </button>

          <button class="btn-primary" type="submit" :disabled="isSubmitting">
            {{
              isSubmitting
                ? isEditing
                  ? 'Updating…'
                  : 'Saving…'
                : isEditing
                  ? 'Update Promotion'
                  : 'Save Promotion'
            }}
          </button>
        </div>
      </form>
    </template>

    <!-- SEARCH -->
    <template #search>
      <div class="users-search">
        <span class="users-search__icon">🔍</span>
        <input
          v-model="searchTerm"
          class="users-search__input"
          type="text"
          placeholder="Search by name, status, description…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Name</th>
      <th style="width: 140px">Discount (%)</th>
      <th style="width: 120px">Status</th>
      <th style="width: 140px">Start</th>
      <th style="width: 140px">End</th>
      <th>Description</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ formatPercent(item.discountRate) }}</td>
      <td>
  <span :class="['status-badge', item.status === 'ACTIVE' ? 'active' : 'inactive']">
    {{ item.status }}
  </span>
</td>
      <td>{{ item.startDate }}</td>
      <td>{{ item.endDate }}</td>
      <td>{{ item.description ?? '-' }}</td>
      <td>
        <div style="display: flex; gap: 0.25rem">
          <button class="btn-secondary" type="button" @click="onClickEdit(item)">Edit</button>
          <button
            class="btn-secondary btn-secondary--danger"
            type="button"
            @click="onClickDelete(item.id)"
          >
            Delete
          </button>
        </div>
      </td>
    </template>
  </TablePage>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch, reactive } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'
  import { usePromotionsStore } from '../stores/usePromotionsStore'
  import type { PromotionDto } from '../dtos/PromotionDto'

  const promotionsStore = usePromotionsStore()
  const { items: promotions, loading, error } = storeToRefs(promotionsStore)

  const searchTerm = ref('')

  onMounted(() => {
    promotionsStore.loadPromotions()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // filter
  const filteredPromotions = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return promotions.value

    return promotions.value.filter((p) => {
      return (
        (p.name ?? '').toLowerCase().includes(term) ||
        (p.status ?? '').toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term)
      )
    })
  })

  const totalPromotions = computed(() => promotions.value.length)
  const filteredCount = computed(() => filteredPromotions.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredPromotions, () => {
    currentPage.value = 1
  })

  const paginatedPromotions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredPromotions.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  // form
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

    const blank = () => ({
  name: '',
  discountRate: 0,
  description: null,
  startDate: '',
  endDate: '',
})

const form = reactive(blank())

  const resetForm = () => {
    Object.assign(form, blank())
    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const onClickNew = () => {
    if (showForm.value) {
      resetForm()
      showForm.value = false
      return
    }
    resetForm()
    showForm.value = true
  }

  const onClickEdit = (p: PromotionDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = p.id

    Object.assign(form, {
      name: p.name ?? '',
      discountRate: p.discountRate ?? 0,
      description: p.description ?? null,
      startDate: p.startDate ?? '',
      endDate: p.endDate ?? '',
     
    })

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!form.name.trim()) {
      formError.value = 'Promotion name is required.'
      return
    }

    if (form.discountRate == null || form.discountRate < 0 || form.discountRate > 100) {
      formError.value = 'Discount rate must be between 0 and 100.'
      return
    }

    if (!form.startDate || !form.endDate) {
      formError.value = 'Start date and end date are required.'
      return
    }

    if (form.endDate < form.startDate) {
      formError.value = 'End date must be after start date.'
      return
    }

    isSubmitting.value = true
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
      }

      if (isEditing.value && editingId.value != null) {
        await promotionsStore.updatePromotion(editingId.value, payload)
      } else {
        await promotionsStore.createPromotion(payload)
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save promotion.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this promotion?')
    if (!ok) return

    try {
      await promotionsStore.deletePromotion(id)

      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete promotion.')
    }
  }

  function toNumOrNull(v: string): number | null {
    const t = v.trim()
    if (!t) return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }

  function formatPercent(v?: number | null) {
    if (v == null || Number.isNaN(v)) return '-'
    return `${v}%`
  }
</script>

<style scoped src="@/styles/admin/admin-table.css"></style>
<style scoped src="@/styles/admin/admin-form.css"></style>
<style>
.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}</style>