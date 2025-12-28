<template>
  <TablePage
    title="Categories"
    :total="totalCategories"
    :filteredCount="filteredCount"
    :items="paginatedCategories"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="
      showForm && !isEditing ? 'Close Form' : isEditing ? 'Editing...' : 'Create New Category'
    "
    idKey="id"
    @click-new="onClickNew"
    @change-page="goToPage"
    :editingId="editingId"
  >
    <!-- FORM SLOT (create / edit) -->
    <template #form>
      <h3 class="category-form__title">
        {{ isEditing ? 'Edit Category' : 'New Category' }}
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
          placeholder="e.g. Rings"
          required
        />
      </div>

      <div class="category-form__row">
        <label class="category-form__label" for="code">Code *</label>
        <input
          id="code"
          v-model="formCode"
          type="text"
          class="category-form__input"
          placeholder="e.g. RING"
          required
        />
      </div>

      <div class="category-form__row">
        <label class="category-form__label" for="description">Description</label>
        <textarea
          id="description"
          v-model="formDescription"
          rows="3"
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
                ? 'Update Category'
                : 'Save Category'
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
          placeholder="Search by name, code or description…"
          class="users-search__input"
        />
      </div>
    </template>

    <!-- TABLE COLUMNS SLOT -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Name</th>
      <th>Code</th>
      <th>Description</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- TABLE ROWS SLOT -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.code }}</td>
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
  import { useCategoriesStore } from '../stores/useCategoriesStore'
  import type { CategoryDto } from '../dtos/CategoryDto'
  import TablePage from '../components/TablePage.vue'

  const searchTerm = ref('')

  const categoriesStore = useCategoriesStore()
  const { items: categories, loading, error } = storeToRefs(categoriesStore)

  onMounted(() => {
    categoriesStore.loadCategories()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  /* -------- Filtered categories -------- */
  const filteredCategories = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return categories.value

    return categories.value.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      )
    })
  })

  const totalCategories = computed(() => categories.value.length)
  const filteredCount = computed(() => filteredCategories.value.length)

  /* -------- Pagination -------- */
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredCategories, () => {
    currentPage.value = 1
  })

  const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredCategories.value.slice(start, end)
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
  const formCode = ref('')
  const formDescription = ref('')
  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const resetForm = () => {
    formName.value = ''
    formCode.value = ''
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

  const onClickEdit = (category: CategoryDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = category.id
    formName.value = category.name
    formCode.value = category.code
    formDescription.value = category.description ?? ''
    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim() || !formCode.value.trim()) {
      formError.value = 'Name and Code are required.'
      return
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await categoriesStore.updateCategory(editingId.value, {
          name: formName.value.trim(),
          code: formCode.value.trim(),
          description: formDescription.value.trim() || undefined,
        })
      } else {
        await categoriesStore.createCategory({
          name: formName.value.trim(),
          code: formCode.value.trim(),
          description: formDescription.value.trim() || undefined,
        })
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving the category.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this category?')
    if (!ok) return

    try {
      await categoriesStore.deleteCategory(id)

      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert((e as any)?.message ?? 'Something went wrong while deleting the category.')
    }
  }
</script>
