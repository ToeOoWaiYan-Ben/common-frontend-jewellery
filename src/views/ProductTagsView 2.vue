<!-- src/views/ProductTagsView.vue -->
<template>
  <TablePage
    title="Product Tags"
    :total="totalProductTags"
    :filteredCount="filteredCount"
    :items="paginatedProductTags"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="
      showForm && !isEditing ? 'Close Form' : isEditing ? 'Editing...' : 'Create New Product Tag'
    "
    idKey="id"
    @click-new="onClickNew"
    @change-page="goToPage"
    :editingId="editingId"
  >
    <!-- FORM SLOT (create / edit) -->
    <template #form>
      <h3 class="category-form__title">
        {{ isEditing ? 'Edit Product Tag' : 'New Product Tag' }}
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
          type="text"
          class="category-form__input"
          placeholder="e.g. Premium"
          required
        />
      </div>

      <div class="category-form__row">
        <label class="category-form__label" for="description">Description</label>
        <textarea
          id="description"
          v-model="formDescription"
          rows="4"
          class="category-form__input category-form__textarea"
          placeholder="Optional description…"
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

        <button
          class="btn-primary"
          type="button"
          @click="handleSubmitForm"
          :disabled="isSubmitting"
        >
          {{
            isSubmitting
              ? isEditing
                ? 'Updating…'
                : 'Saving…'
              : isEditing
                ? 'Update Product Tag'
                : 'Save Product Tag'
          }}
        </button>
      </div>
    </template>

    <!-- SEARCH SLOT -->
    <template #search>
      <div class="users-search">
        <span class="users-search__icon">🔍</span>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search by name or description…"
          class="users-search__input"
        />
      </div>
    </template>

    <!-- TABLE COLUMNS SLOT -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Name</th>
      <th>Description</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- TABLE ROWS SLOT -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.description }}</td>
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
  import type { ProductTagDto } from '../dtos/ProductTagDto'
  import { useProductTagsStore } from '../stores/useProductTagsStore'

  const searchTerm = ref('')

  const productTagsStore = useProductTagsStore()
  const { items: productTags, loading, error } = storeToRefs(productTagsStore)

  onMounted(() => {
    productTagsStore.loadProductTags()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  /* -------- Filtered product tags -------- */
  const filteredProductTags = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return productTags.value

    return productTags.value.filter((t) => {
      return (
        t.name.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      )
    })
  })

  const totalProductTags = computed(() => productTags.value.length)
  const filteredCount = computed(() => filteredProductTags.value.length)

  /* -------- Pagination -------- */
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredProductTags, () => {
    currentPage.value = 1
  })

  const paginatedProductTags = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredProductTags.value.slice(start, end)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  /* -------- Form state (create + update) -------- */
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formDescription = ref('')
  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const resetForm = () => {
    formName.value = ''
    formDescription.value = ''
    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const onClickNew = () => {
    resetForm()
    isEditing.value = false
    showForm.value = !showForm.value
  }

  const onClickEdit = (tag: ProductTagDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = tag.id
    formName.value = tag.name
    formDescription.value = tag.description ?? ''
    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim()) {
      formError.value = 'Name is required.'
      return
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await productTagsStore.updateProductTag(editingId.value, {
          name: formName.value.trim(),
          description: formDescription.value.trim() || null,
        })
      } else {
        await productTagsStore.createProductTag({
          name: formName.value.trim(),
          description: formDescription.value.trim() || null,
        })
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving the product tag.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this product tag?')
    if (!ok) return

    try {
      await productTagsStore.deleteProductTag(id)

      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert((e as any)?.message ?? 'Something went wrong while deleting the product tag.')
    }
  }
</script>
