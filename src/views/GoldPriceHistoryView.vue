<template>
  <TablePage
    title="Gold Price History"
    :total="totalItems"
    :filteredCount="filteredCount"
    :items="paginatedItems"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Record'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Gold Price' : 'New Gold Price' }}
        </h3>

        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <!-- Record Date -->
        <div class="category-form__row">
          <label class="category-form__label" for="recordDate">Record Date *</label>
          <input
            id="recordDate"
            v-model="form.recordDate"
            class="category-form__input"
            type="date"
            required
          />
        </div>

        <!-- Purity -->
        <div class="category-form__row">
          <label class="category-form__label" for="purity">Purity *</label>
          <select id="purity" v-model="form.purity" class="category-form__input" required>
            <option value="K24">24K</option>
            <option value="K22">22K</option>
            <option value="K18">18K</option>
            <option value="K14">14K</option>
          </select>
        </div>

        <!-- Buy Price -->
        <div class="category-form__row">
          <label class="category-form__label" for="buyPrice">Buy Price (MMK) *</label>
          <input
            id="buyPrice"
            v-model.number="form.buyPrice"
            class="category-form__input"
            type="number"
            min="0"
            step="1"
            required
            placeholder="e.g. 3200000"
          />
        </div>

        <!-- Sell Price -->
        <div class="category-form__row">
          <label class="category-form__label" for="sellPrice">Sell Price (MMK) *</label>
          <input
            id="sellPrice"
            v-model.number="form.sellPrice"
            class="category-form__input"
            type="number"
            min="0"
            step="1"
            required
            placeholder="e.g. 3300000"
          />
        </div>

        <!-- Status (optional to show) -->
        <div class="category-form__row">
          <label class="category-form__label" for="status">Status *</label>
          <select id="status" v-model="form.status" class="category-form__input" required>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <small style="display: block; margin-top: 6px; color: #64748b">
            When creating a new record, backend should set this to ACTIVE and make previous ones
            INACTIVE.
          </small>
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
                  ? 'Update Record'
                  : 'Save Record'
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
          placeholder="Search by date, purity, unit, status…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Date</th>
      <th>Purity</th>
      <th>Buy Price</th>
      <th>Sell Price</th>
      <th>Status</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.recordDate }}</td>
      <td>{{ item.purity }}</td>
      <td>{{ formatMMK(item.buyPrice) }}</td>
      <td>{{ formatMMK(item.sellPrice) }}</td>
      <td>{{ item.status }}</td>
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
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'
  import { useGoldPriceHistoryStore } from '../stores/useGoldPriceHistoryStore'
  import type { GoldPriceHistoryDto } from '../dtos/GoldPriceHistoryDto'

  const store = useGoldPriceHistoryStore()
  const { items, loading, error } = storeToRefs(store)

  const searchTerm = ref('')

  onMounted(() => {
    store.loadAll()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // filter
  const filteredItems = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return items.value

    return items.value.filter((x) => {
      return (
        x.recordDate.toLowerCase().includes(term) ||
        x.purity.toLowerCase().includes(term) ||
        x.status.toLowerCase().includes(term)
      )
    })
  })

  const totalItems = computed(() => items.value.length)
  const filteredCount = computed(() => filteredItems.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredItems, () => {
    currentPage.value = 1
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  // form state
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const form = reactive<Omit<GoldPriceHistoryDto, 'id' | 'createdAt' | 'updatedAt'>>({
    recordDate: '',
    purity: 'K24',
    buyPrice: 0,
    sellPrice: 0,
    status: 'ACTIVE',
  })

  const resetForm = () => {
    form.recordDate = ''
    form.purity = 'K24'
    form.buyPrice = 0
    form.sellPrice = 0
    form.status = 'ACTIVE'

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

  const onClickEdit = (x: GoldPriceHistoryDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = x.id

    form.recordDate = x.recordDate
    form.purity = x.purity
    form.buyPrice = x.buyPrice
    form.sellPrice = x.sellPrice
    form.status = x.status

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!form.recordDate) {
      formError.value = 'Record date is required.'
      return
    }
    if (form.buyPrice <= 0 || form.sellPrice <= 0) {
      formError.value = 'Buy price and sell price must be greater than 0.'
      return
    }
    if (form.sellPrice < form.buyPrice) {
      formError.value = 'Sell price should not be lower than buy price.'
      return
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await store.update(editingId.value, { ...form })
      } else {
        await store.create({ ...form })
      }

      await store.loadAll()
      closeEdit()
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save record.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this record?')
    if (!ok) return

    try {
      await store.remove(id)
      await store.loadAll()
      if (isEditing.value && editingId.value === id) {
        closeEdit()
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete record.')
    }
  }

  function formatMMK(v: number) {
    if (v == null || Number.isNaN(v)) return '-'
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(v) + ' MMKs'
    )
  }
</script>

<style scoped src="@/styles/admin/admin-table.css"></style>
<style scoped src="@/styles/admin/admin-form.css"></style>
