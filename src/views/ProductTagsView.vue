<template>
  <TablePage
    title="Product Tags"
    :total="totalTags"
    :filteredCount="filteredCount"
    :items="paginatedTags"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Tag'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Product Tag' : 'New Product Tag' }}
        </h3>

        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="tagName">Tag Name *</label>
          <input
            id="tagName"
            v-model="formName"
            class="category-form__input"
            type="text"
            required
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="tagDesc">Description</label>
          <textarea
            id="tagDesc"
            v-model="formDescription"
            rows="3"
            class="category-form__input category-form__textarea"
            placeholder="Optional description…"
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
                  ? 'Update Tag'
                  : 'Save Tag'
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
          placeholder="Search by tag name or description…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 80px">#</th>
      <th style="width: 240px">Tag Name</th>
      <th>Description</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.description || '-' }}</td>
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
  import TablePage from '@/components/TablePage.vue'
  import { useProductTagsStore } from '@/stores/useProductTagsStore'
  import type { ProductTagDto } from '@/dtos/ProductTagDto'

  const tagsStore = useProductTagsStore()
  const { items: tags, loading, error } = storeToRefs(tagsStore)

  const searchTerm = ref('')

  onMounted(() => {
    tagsStore.loadTags()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // filter
  const filteredTags = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return tags.value

    return tags.value.filter((t) => {
      const name = (t.name ?? '').toLowerCase()
      const desc = (t.description ?? '').toLowerCase()
      return name.includes(term) || desc.includes(term)
    })
  })

  const totalTags = computed(() => tags.value.length)
  const filteredCount = computed(() => filteredTags.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  watch(filteredTags, () => {
    currentPage.value = 1
  })

  const paginatedTags = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredTags.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  // form states
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

  const onClickNew = () => {
    if (showForm.value) {
      resetForm()
      showForm.value = false
      return
    }
    resetForm()
    showForm.value = true
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

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim()) {
      formError.value = 'Tag name is required.'
      return
    }

    const payload = {
      name: formName.value.trim(),
      description: formDescription.value.trim() || null,
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await tagsStore.updateTag(editingId.value, payload)
      } else {
        await tagsStore.createTag(payload)
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save product tag.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this product tag?')
    if (!ok) return

    try {
      await tagsStore.deleteTag(id)
      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete product tag.')
    }
  }
</script>
