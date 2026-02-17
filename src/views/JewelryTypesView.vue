<template>
  <TablePage
    title="Jewelry Types"
    :total="totalTypes"
    :filteredCount="filteredCount"
    :items="paginatedTypes"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Jewelry Type'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Jewelry Type' : 'New Jewelry Type' }}
        </h3>

        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="typeName">Type Name *</label>
          <input
            id="typeName"
            v-model="formName"
            class="category-form__input"
            type="text"
            required
          />
        </div>
        <div class="category-form__row">
          <label class="category-form__label" for="description">Description</label>
          <textarea
            id="description"
            v-model="formDescription"
            class="category-form__input"
            rows="3"
          ></textarea>
        </div>

        <!-- ✅ Image Upload -->
        <div class="category-form__row">
          <label class="category-form__label">Type Image</label>

          <input class="category-form__input" type="file" accept="image/*" @change="onFileChange" />

          <small v-if="uploadingImage" style="color: #555">Uploading…</small>
          <small v-if="imageUploadError" class="gp-error">{{ imageUploadError }}</small>

          <div v-if="formImageUrl" style="margin-top: 10px">
            <img
              :src="formImageUrl"
              alt="Preview"
              style="
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 10px;
                border: 1px solid #ddd;
              "
            />
          </div>
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="categoryId">Category *</label>
          <select id="categoryId" v-model="formCategoryId" class="category-form__input" required>
            <option :value="null">Select category</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
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
                  ? 'Update Type'
                  : 'Save Type'
            }}
          </button>
        </div>
      </form>
    </template>

    <!-- SEARCH + FILTER -->
    <template #search>
      <div style="display: grid; gap: 10px">
        <div class="users-search">
          <span class="users-search__icon">🔍</span>
          <input
            v-model="searchTerm"
            class="users-search__input"
            type="text"
            placeholder="Search by type name or category…"
          />
        </div>

        <div style="display: flex; gap: 10px; align-items: center">
          <label style="font-weight: 600">Filter Category:</label>
          <select v-model="filterCategoryId" class="category-form__input" style="max-width: 280px">
            <option :value="null">All categories</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>

          <button class="btn-secondary" type="button" @click="reloadTypes">Apply</button>
        </div>
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 80px">#</th>
      <th>Type Name</th>
      <th>Category</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.categoryName ?? '-' }}</td>
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
  import { useJewelryTypesStore } from '../stores/useJewelryTypesStore'
  import { useCategoriesStore } from '../stores/useCategoriesStore'
  import type { JewelryTypeDto } from '../dtos/JewelryTypeDto'
  import { http } from '../services/http'

  const typesStore = useJewelryTypesStore()
  const categoriesStore = useCategoriesStore()
  const formDescription = ref<string | null>(null)

  const { items: types, loading, error } = storeToRefs(typesStore)
  const { items: categories } = storeToRefs(categoriesStore)

  const searchTerm = ref('')
  const filterCategoryId = ref<number | null>(null)

  onMounted(async () => {
    await categoriesStore.loadCategories()
    await typesStore.loadJewelryTypes()
  })

  const reloadTypes = async () => {
    await typesStore.loadJewelryTypes(filterCategoryId.value)
  }

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  const filteredTypes = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return types.value

    return types.value.filter(
      (t) =>
        t.name.toLowerCase().includes(term) || (t.categoryName ?? '').toLowerCase().includes(term)
    )
  })

  const totalTypes = computed(() => types.value.length)
  const filteredCount = computed(() => filteredTypes.value.length)

  const pageSize = ref(20)
  const currentPage = ref(1)

  watch(filteredTypes, () => {
    currentPage.value = 1
  })

  const paginatedTypes = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredTypes.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formCategoryId = ref<number | null>(null)

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const formImageUrl = ref<string | null>(null)
  const uploadingImage = ref(false)
  const imageUploadError = ref<string | null>(null)

  async function uploadTypeImage(file: File) {
    uploadingImage.value = true
    imageUploadError.value = null

    try {
      const fd = new FormData()
      fd.append('file', file)

      // ✅ expects backend: POST /api/images (your controller is /api/images)
      // if your API_BASE_URL already includes "/api", use "/images"
      // otherwise use "/api/images"
      const uploaded = await http<{ id: number; url: string }>('/images/upload', {
        method: 'POST',
        body: fd,
      })

      formImageUrl.value = uploaded.url
    } catch (e: any) {
      imageUploadError.value = e?.message ?? 'Failed to upload image.'
    } finally {
      uploadingImage.value = false
    }
  }
  function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    uploadTypeImage(file)
  }

  const resetForm = () => {
    formName.value = ''
    formCategoryId.value = null
    formDescription.value = null
    formError.value = null
    isEditing.value = false
    editingId.value = null
    formImageUrl.value = null
    imageUploadError.value = null
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

  const onClickEdit = (type: JewelryTypeDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = type.id

    formName.value = type.name
    formCategoryId.value = type.categoryId ?? null
    formDescription.value = type.description ?? null

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
    formImageUrl.value = type.imageUrl ?? null
    imageUploadError.value = null
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim() || formCategoryId.value == null) {
      formError.value = 'Type name and category are required.'
      return
    }

    const payload = {
      name: formName.value.trim(),
      categoryId: formCategoryId.value,
      categoryName: null,
      imageUrl: formImageUrl.value ?? null,
      description: formDescription.value ?? null,
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await typesStore.updateJewelryType(editingId.value, payload)
      } else {
        await typesStore.createJewelryType(payload)
      }

      resetForm()
      showForm.value = false
      await reloadTypes()
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save jewelry type.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this jewelry type?')
    if (!ok) return

    try {
      await typesStore.deleteJewelryType(id)
      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
      await reloadTypes()
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete jewelry type.')
    }
  }
</script>
