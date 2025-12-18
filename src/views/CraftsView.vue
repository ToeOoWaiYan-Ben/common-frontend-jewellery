<template>
  <main class="content">
    <PageHeader title="Crafts" subtitle="Manage craft shops">
      <template #right>
        <button class="btn-primary" type="button" @click="onClickNew">
          {{
            showForm && !isEditing
              ? 'Close Form'
              : isEditing
                ? 'Editing...'
                : 'Create Craft'
          }}
        </button>
      </template>
    </PageHeader>

    <FilterBar>
      <input v-model="search" class="search-input" placeholder="Search crafts..." />
      <div class="pill">
        Showing <strong>{{ filteredCount }}</strong> / <strong>{{ total }}</strong>
      </div>
    </FilterBar>

    <CraftForm
      v-if="showForm"
      :title="isEditing ? 'Edit Craft' : 'New Craft'"
      :submitLabel="isEditing ? 'Update Craft' : 'Create Craft'"
      :busyLabel="isEditing ? 'Updating…' : 'Saving…'"
      :submitting="submitting"
      :error="formError"
      v-model:shopName="formShopName"
      v-model:nrc="formNrc"
      v-model:phone="formPhone"
      v-model:address="formAddress"
      @submit="handleSubmit"
      @cancel="closeForm"
    />

    <section v-if="errorMessage" class="panel">
      <div class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>
    </section>

    <section v-else-if="isLoading" class="panel">
      <div class="users-empty">Loading crafts…</div>
    </section>

    <AdminTable
      v-else
      :columns="columns"
      :rows="filteredRows"
      title="All crafts"
      :page-size="20"
      :editingId="editingId"
      :rowKey="'id'"
      @page-change="onPageChange"
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
import AdminTable, { type TableColumn } from '../components/admin/AdminTable.vue'
import CraftForm from '../components/admin/CraftForm.vue' // ✅ FIXED PATH

import { useCraftsStore } from '../stores/useCraftsStore'
import type { CraftDto } from '../dtos/CraftDto'

const store = useCraftsStore()
const { items, loading, error } = storeToRefs(store)

onMounted(() => {
  store.loadCrafts()
})

const isLoading = computed(() => loading.value)
const errorMessage = computed(() => error.value)

const search = ref('')

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return items.value

  return items.value.filter((c: CraftDto) => {
    return (
      (c.shop_name ?? '').toLowerCase().includes(term) ||
      (c.nrc ?? '').toLowerCase().includes(term) ||
      (c.phone ?? '').toLowerCase().includes(term) ||
      (c.address ?? '').toLowerCase().includes(term)
    )
  })
})

const total = computed(() => items.value.length)
const filteredCount = computed(() => filteredRows.value.length)

const columns: TableColumn[] = [
  { key: 'id', label: '#', width: '70px' },
  { key: 'shop_name', label: 'Shop Name' },
  { key: 'nrc', label: 'NRC', width: '180px' },
  { key: 'phone', label: 'Phone', width: '140px' },
  { key: 'address', label: 'Address' },
  { key: 'actions', label: '', width: '160px', align: 'right' }
]

function onPageChange(page: number) {
  console.log('Crafts page →', page)
}

/* ----- form state ----- */
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const formShopName = ref('')
const formNrc = ref('')
const formPhone = ref('')
const formAddress = ref('')

const submitting = ref(false)
const formError = ref<string | null>(null)

function resetForm() {
  formShopName.value = ''
  formNrc.value = ''
  formPhone.value = ''
  formAddress.value = ''
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

function onClickEdit(row: CraftDto) {
  showForm.value = true
  isEditing.value = true
  editingId.value = Number(row.id)

  formShopName.value = row.shop_name ?? ''
  formNrc.value = row.nrc ?? ''
  formPhone.value = row.phone ?? ''
  formAddress.value = row.address ?? ''
  formError.value = null

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  formError.value = null

  if (
    !formShopName.value.trim() ||
    !formNrc.value.trim() ||
    !formPhone.value.trim() ||
    !formAddress.value.trim()
  ) {
    formError.value = 'Shop Name, NRC, Phone, and Address are required.'
    return
  }

  submitting.value = true
  try {
    const payload = {
      shop_name: formShopName.value.trim(),
      nrc: formNrc.value.trim(),
      phone: formPhone.value.trim(),
      address: formAddress.value.trim()
    }

    if (isEditing.value && editingId.value != null) {
      await store.updateCraft(editingId.value, payload)
    } else {
      await store.createCraft(payload)
    }

    closeForm()
  } catch (e: any) {
    formError.value = e?.message ?? 'Something went wrong while saving craft.'
  } finally {
    submitting.value = false
  }
}

async function onClickDelete(id: number) {
  const ok = window.confirm('Are you sure you want to delete this craft?')
  if (!ok) return

  try {
    await store.deleteCraft(id)
    if (editingId.value === id) closeForm()
  } catch (e: any) {
    alert(e?.message ?? 'Something went wrong while deleting craft.')
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
