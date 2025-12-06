<template>
  <section>
    <!-- Header + create button -->
    <div class="users-header">
      <div>
        <h2 class="page-title">Categories</h2>
        <p class="users-meta">
          Showing
          <strong>{{ filteredCount }}</strong>
          of
          <strong>{{ totalCategories }}</strong>
          categories
        </p>
      </div>

      <div class="users-header__actions">
        <button class="btn-primary" type="button" @click="onClickNew">
          {{
            showForm && !isEditing
              ? 'Close Form'
              : isEditing
                ? 'Editing...'
                : 'Create New Category'
          }}
        </button>
      </div>
    </div>

    <!-- Card -->
    <div class="card" ref="cardRef">
      <!-- Inline form (Create + Update) -->
      <div v-if="showForm" class="category-form">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Category' : 'New Category' }}
        </h3>

        <!-- error -->
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
          <button
            class="btn-secondary"
            type="button"
            @click="resetForm"
            :disabled="isSubmitting"
          >
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
            {{ isSubmitting
              ? isEditing
                ? 'Updating…'
                : 'Saving…'
              : isEditing
                ? 'Update Category'
                : 'Save Category' }}
          </button>
        </div>
      </div>

      <!-- Backend error -->
      <div v-if="errorMessage" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Loading -->
      <div v-else-if="isLoading" class="users-empty">
        Loading categories…
      </div>

      <!-- Search + pagination + table -->
      <template v-else>
        <!-- Search bar -->
        <div class="users-search">
          <span class="users-search__icon">🔍</span>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by name, code or description…"
            class="users-search__input"
          />
        </div>

        <!-- Top pagination controls -->
        <div class="table-pagination" v-if="filteredCount > 0">
          <div class="table-pagination__info">
            Page {{ currentPage }} of {{ totalPages }}
            <span v-if="filteredCount">
              • {{ filteredCount }} result<span v-if="filteredCount > 1">s</span>
            </span>
          </div>
          <div class="table-pagination__buttons">
            <button
              class="btn-page"
              type="button"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              ‹ Prev
            </button>

            <button
              v-for="page in pagesToShow"
              :key="page"
              class="btn-page"
              :class="{ 'btn-page--active': page === currentPage }"
              type="button"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              class="btn-page"
              type="button"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Next ›
            </button>
          </div>
        </div>

        <!-- Table -->
        <table class="table users-table" v-if="paginatedCategories.length">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th style="width: 190px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in paginatedCategories"
              :key="category.id"
              :class="{ 'row--editing': category.id === editingId }"
            >
              <td>{{ category.id }}</td>
              <td>{{ category.name }}</td>
              <td>{{ category.code }}</td>
              <td>{{ category.description }}</td>
              <td>
                <div style="display: flex; gap: 0.25rem;">
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="onClickEdit(category)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn-secondary btn-secondary--danger"
                    @click="onClickDelete(category.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="users-empty">
          No categories found for
          “<span class="users-empty__term">{{ searchTerm }}</span>”.
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '../stores/useCategoriesStore'
import type { CategoryDto } from '../dtos/CategoryDto'

const searchTerm = ref('')

const categoriesStore = useCategoriesStore()
const { items: categories, loading, error } = storeToRefs(categoriesStore)

onMounted(() => {
  categoriesStore.loadCategories()
  console.log('Categories onMounted call!!!')
})

const isLoading = computed(() => loading.value)
const errorMessage = computed(() => error.value)

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
  filteredCount.value === 0
    ? 1
    : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
)

const pagesToShow = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxButtons = 5

  // If total pages <= maxButtons, just show all
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  let start = current - Math.floor(maxButtons / 2) // try to center current page
  let end = current + Math.floor(maxButtons / 2)

  // Clamp to valid range
  if (start < 1) {
    start = 1
    end = maxButtons
  } else if (end > total) {
    end = total
    start = total - maxButtons + 1
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})


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

/* -------- Scroll helper -------- */
const cardRef = ref<HTMLElement | null>(null)

const scrollToTop = async () => {
  await nextTick()
  if (cardRef.value) {
    cardRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
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
  // open in create mode
  resetForm()
  isEditing.value = false
  showForm.value = !showForm.value
}

const onClickEdit = (category: CategoryDto) => {
  console.log('Edit clicked for', category)
  showForm.value = true
  isEditing.value = true
  editingId.value = category.id
  formName.value = category.name
  formCode.value = category.code
  formDescription.value = category.description ?? ''
  formError.value = null

  // scroll to top when clicking Edit
  scrollToTop()
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
      // UPDATE
      await categoriesStore.updateCategory(editingId.value, {
        name: formName.value.trim(),
        code: formCode.value.trim(),
        description: formDescription.value.trim() || undefined
      })

      // scroll to top after successful update
      await scrollToTop()
    } else {
      // CREATE
      await categoriesStore.createCategory({
        name: formName.value.trim(),
        code: formCode.value.trim(),
        description: formDescription.value.trim() || undefined
      })
    }

    resetForm()
    showForm.value = false
  } catch (e: any) {
    console.error('Error saving category', e)
    formError.value =
      e?.message ?? 'Something went wrong while saving the category.'
  } finally {
    isSubmitting.value = false
  }
}

const onClickDelete = async (id: number) => {
  console.log('Delete clicked for id', id)
  const ok = window.confirm('Are you sure you want to delete this category?')
  if (!ok) return

  try {
    await categoriesStore.deleteCategory(id)

    if (isEditing.value && editingId.value === id) {
      resetForm()
      showForm.value = false
    }
  } catch (e: any) {
    console.error('Error deleting category', e)
    alert(
      (e as any)?.message ??
        'Something went wrong while deleting the category.'
    )
  }
}
</script>
