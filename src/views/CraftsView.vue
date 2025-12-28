<template>
  <TablePage
    title="Crafts"
    :total="totalCrafts"
    :filteredCount="filteredCount"
    :items="paginatedCrafts"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Craft'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Craft' : 'New Craft' }}
        </h3>

        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="shopName">Shop Name *</label>
          <input
            id="shopName"
            v-model="formShopName"
            class="category-form__input"
            type="text"
            required
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="nrc">NRC *</label>
          <input id="nrc" v-model="formNrc" class="category-form__input" type="text" required />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="phone">Phone *</label>
          <input id="phone" v-model="formPhone" class="category-form__input" type="text" required />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="address">Address *</label>
          <textarea
            id="address"
            v-model="formAddress"
            rows="3"
            class="category-form__input category-form__textarea"
            required
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

          <button class="btn-primary" type="submit" :disabled="isSubmitting">
            {{
              isSubmitting
                ? isEditing
                  ? 'Updating…'
                  : 'Saving…'
                : isEditing
                  ? 'Update Craft'
                  : 'Save Craft'
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
          placeholder="Search by shop name, NRC, phone, address…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Shop Name</th>
      <th>NRC</th>
      <th>Phone</th>
      <th>Address</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.shopName }}</td>
      <td>{{ item.nrc }}</td>
      <td>{{ item.phone }}</td>
      <td>{{ item.address }}</td>
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
  import { computed, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'
  import { useCraftsStore } from '../stores/useCraftsStore'
  import type { CraftDto } from '../dtos/CraftDto'

  const craftsStore = useCraftsStore()
  const { items: crafts, loading, error } = storeToRefs(craftsStore)

  const searchTerm = ref('')

  onMounted(() => {
    craftsStore.loadCrafts()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // filter
  const filteredCrafts = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return crafts.value

    return crafts.value.filter(
      (c) =>
        c.shopName.toLowerCase().includes(term) ||
        c.nrc.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term)
    )
  })

  const totalCrafts = computed(() => crafts.value.length)
  const filteredCount = computed(() => filteredCrafts.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  watch(filteredCrafts, () => {
    currentPage.value = 1
  })

  const paginatedCrafts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredCrafts.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  // form states
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  // ✅ rename for clarity (input uses shopName but your ref variable name can be anything)
  const formShopName = ref('')
  const formNrc = ref('')
  const formPhone = ref('')
  const formAddress = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const resetForm = () => {
    formShopName.value = ''
    formNrc.value = ''
    formPhone.value = ''
    formAddress.value = ''
    formError.value = null
    isEditing.value = false
    editingId.value = null
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

  const onClickEdit = (craft: CraftDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = craft.id

    // ✅ use shopName
    formShopName.value = craft.shopName
    formNrc.value = craft.nrc
    formPhone.value = craft.phone
    formAddress.value = craft.address

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (
      !formShopName.value.trim() ||
      !formNrc.value.trim() ||
      !formPhone.value.trim() ||
      !formAddress.value.trim()
    ) {
      formError.value = 'All fields are required.'
      return
    }

    // ✅ IMPORTANT: send shopName (backend expects this)
    const payload = {
      shopName: formShopName.value.trim(),
      nrc: formNrc.value.trim(),
      phone: formPhone.value.trim(),
      address: formAddress.value.trim(),
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await craftsStore.updateCraft(editingId.value, payload)
      } else {
        await craftsStore.createCraft(payload)
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save craft.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this craft?')
    if (!ok) return

    try {
      await craftsStore.deleteCraft(id)
      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete craft.')
    }
  }
</script>
