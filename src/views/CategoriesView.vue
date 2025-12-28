<template>
  <main class="content">
    <PageHeader title="Categories" subtitle="Manage product categories">
      <template #right>
        <button class="btn-primary" type="button" @click="onClickNew">
          {{ showForm && !isEditing ? 'Close Form' : isEditing ? 'Editing...' : 'Create Category' }}
        </button>
      </template>
    </PageHeader>

    <FilterBar>
      <input v-model="search" class="search-input" placeholder="Search categories..." />
      <div class="pill">
        Showing <strong>{{ filteredCount }}</strong> / <strong>{{ total }}</strong>
      </div>
    </FilterBar>

    <CategoryForm
      v-if="showForm"
      :title="isEditing ? 'Edit Category' : 'New Category'"
      :submitLabel="isEditing ? 'Update Category' : 'Create Category'"
      :busyLabel="isEditing ? 'Updating…' : 'Saving…'"
      :submitting="submitting"
      :error="formError"
      @submit="handleSubmit"
      @cancel="closeForm"
    >
      <div class="category-form__row">
        <label class="category-form__label">Name *</label>
        <input v-model="formName" class="category-form__input" placeholder="e.g. Rings" />
      </div>

      <div class="category-form__row">
        <label class="category-form__label">Code *</label>
        <input v-model="formCode" class="category-form__input" placeholder="e.g. RING" />
      </div>

      <div class="category-form__row">
        <label class="category-form__label">Description</label>
        <textarea
          v-model="formDescription"
          rows="3"
          class="category-form__input category-form__textarea"
        />
      </div>
    </CategoryForm>

    <section v-if="errorMessage" class="panel">
      <div class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>
    </section>

    <section v-else-if="isLoading" class="panel">
      <div class="users-empty">Loading categories…</div>
    </section>

    <AdminTable
      v-else
      :columns="columns"
      :rows="filteredRows"
      title="All categories"
      :page-size="20"
      :editingId="editingId"
      @page-change="onPageChange"
      :rowKey="'id'"
    >
      <template #cell-actions="{ row }">
        <div class="table-actions">
          <button class="btn-link btn-link--primary" type="button" @click="onClickEdit(row)">
            Edit
          </button>
          <button class="btn-link btn-link--danger" type="button" @click="onClickDelete(row.id)">
            Delete
          </button>
        </div>
      </template>
    </AdminTable>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import PageHeader from '../components/admin/PageHeader.vue'
  import FilterBar from '../components/admin/FilterBar.vue'
  import CategoryForm from '../components/admin/Form.vue'
  import AdminTable, { type TableColumn } from '../components/admin/AdminTable.vue'
  import { useCategoriesStore } from '../stores/useCategoriesStore'
  import type { CategoryDto } from '../dtos/CategoryDto'

  const store = useCategoriesStore()
  const { items, loading, error } = storeToRefs(store)

  onMounted(() => {
    store.loadCategories()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  const search = ref('')

  const filteredRows = computed(() => {
    const term = search.value.trim().toLowerCase()
    if (!term) return items.value

    return items.value.filter((c: CategoryDto) => {
      return (
        (c.name ?? '').toLowerCase().includes(term) ||
        (c.code ?? '').toLowerCase().includes(term) ||
        (c.description ?? '').toLowerCase().includes(term)
      )
    })
  })

  const total = computed(() => items.value.length)
  const filteredCount = computed(() => filteredRows.value.length)

  const columns: TableColumn[] = [
    { key: 'id', label: '#', width: '70px' },
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code', width: '140px' },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: '', width: '160px', align: 'right' },
  ]

  function onPageChange(page: number) {
    console.log('Categories page →', page)
  }

  /* ----- form state ----- */
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formCode = ref('')
  const formDescription = ref('')

  const submitting = ref(false)
  const formError = ref<string | null>(null)

  function resetForm() {
    formName.value = ''
    formCode.value = ''
    formDescription.value = ''
    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  function closeForm() {
    resetForm()
    showForm.value = false
  }

  function onClickNew() {
    if (showForm.value && !isEditing.value) {
      closeForm()
      return
    }
    resetForm()
    showForm.value = true
  }

  function onClickEdit(row: CategoryDto) {
    showForm.value = true
    isEditing.value = true
    editingId.value = Number(row.id)

    formName.value = row.name ?? ''
    formCode.value = row.code ?? ''
    formDescription.value = row.description ?? ''
    formError.value = null

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    formError.value = null

    if (!formName.value.trim() || !formCode.value.trim()) {
      formError.value = 'Name and Code are required.'
      return
    }

    submitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await store.updateCategory(editingId.value, {
          name: formName.value.trim(),
          code: formCode.value.trim(),
          description: formDescription.value.trim() || undefined,
        })
      } else {
        await store.createCategory({
          name: formName.value.trim(),
          code: formCode.value.trim(),
          description: formDescription.value.trim() || undefined,
        })
      }

      closeForm()
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving category.'
    } finally {
      submitting.value = false
    }
  }

  async function onClickDelete(id: number) {
    const ok = window.confirm('Are you sure you want to delete this category?')
    if (!ok) return

    try {
      await store.deleteCategory(id)
      if (editingId.value === id) closeForm()
    } catch (e: any) {
      alert(e?.message ?? 'Something went wrong while deleting category.')
    }
  }
</script>

<style scoped>
  .search-input {
    width: 420px;
    max-width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
  }

  .pill {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    background: #fff;
  }

  .table-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .btn-link {
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
  }

  .btn-link--primary {
    color: #1d4ed8;
  }
  .btn-link--danger {
    color: #dc2626;
  }
</style>
