<template>
  <TablePage
    title="Sellers"
    :total="totalSellers"
    :filteredCount="filteredCount"
    :items="paginatedSellers"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? (isEditing ? 'Editing...' : 'Close Form') : 'Create New Seller'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Seller' : 'New Seller' }}
        </h3>

        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="name">Name *</label>
          <input
            id="name"
            v-model="formName"
            class="category-form__input"
            type="text"
            placeholder="e.g. John Seller"
            required
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="phone">Phone</label>
          <input
            id="phone"
            v-model="formPhone"
            class="category-form__input"
            type="text"
            placeholder="e.g. 09xxxxxxx"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="email">Email</label>
          <input
            id="email"
            v-model="formEmail"
            class="category-form__input"
            type="email"
            placeholder="e.g. john@gmail.com"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="address">Address</label>
          <input
            id="address"
            v-model="formAddress"
            class="category-form__input"
            type="text"
            placeholder="e.g. Bangkok"
          />
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

          <button class="btn-primary" type="submit" :disabled="isSubmitting || !formName.trim()">
            {{
              isSubmitting
                ? isEditing
                  ? 'Updating…'
                  : 'Saving…'
                : isEditing
                  ? 'Update Seller'
                  : 'Save Seller'
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
          placeholder="Search by name, phone, email, address…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Name</th>
      <th>Phone</th>
      <th>Email</th>
      <th>Address</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.phone ?? '-' }}</td>
      <td>{{ item.email ?? '-' }}</td>
      <td>{{ item.address ?? '-' }}</td>
      <td>
        <div style="display: flex; gap: 0.25rem">
          <button class="btn-secondary" type="button" @click="onClickEdit(item)">Edit</button>
          <button
            class="btn-secondary btn-secondary--danger"
            type="button"
            @click="onClickDelete(item)"
          >
            Delete
          </button>
        </div>
      </td>
    </template>
  </TablePage>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'
  import { useSellersStore } from '../stores/useSellersStore'
  import type { SellerDto } from '../dtos/SellerDto'

  const sellersStore = useSellersStore()
  const { items: sellers, loading, error } = storeToRefs(sellersStore)

  const searchTerm = ref('')

  onMounted(() => {
    sellersStore.loadAll()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // filter
  const filteredSellers = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return sellers.value

    return sellers.value.filter((s) => {
      return (
        s.name.toLowerCase().includes(term) ||
        (s.phone ?? '').toLowerCase().includes(term) ||
        (s.email ?? '').toLowerCase().includes(term) ||
        (s.address ?? '').toLowerCase().includes(term)
      )
    })
  })

  const totalSellers = computed(() => sellers.value.length)
  const filteredCount = computed(() => filteredSellers.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredSellers, () => {
    currentPage.value = 1
  })

  const paginatedSellers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredSellers.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  // form states
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formPhone = ref('')
  const formEmail = ref('')
  const formAddress = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const resetForm = () => {
    formName.value = ''
    formPhone.value = ''
    formEmail.value = ''
    formAddress.value = ''
    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  const onClickNew = () => {
    if (showForm.value && !isEditing.value) {
      resetForm()
      showForm.value = false
      return
    }

    resetForm()
    showForm.value = true
  }

  const onClickEdit = (seller: SellerDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = seller.id

    formName.value = seller.name
    formPhone.value = seller.phone ?? ''
    formEmail.value = seller.email ?? ''
    formAddress.value = seller.address ?? ''

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim()) {
      formError.value = 'Name is required.'
      return
    }

    const payload: Omit<SellerDto, 'id'> = {
      name: formName.value.trim(),
      phone: formPhone.value.trim() || null,
      email: formEmail.value.trim() || null,
      address: formAddress.value.trim() || null,
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await sellersStore.update(editingId.value, payload)
      } else {
        await sellersStore.create(payload)
      }

      await sellersStore.loadAll()
      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Save failed.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (seller: SellerDto) => {
    const ok = window.confirm(`Delete seller "${seller.name}"?`)
    if (!ok) return

    try {
      await sellersStore.remove(seller.id)
      await sellersStore.loadAll()

      if (isEditing.value && editingId.value === seller.id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert((e as any)?.message ?? 'Delete failed.')
    }
  }
</script>