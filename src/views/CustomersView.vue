<template>
    <main class="content">
      <PageHeader title="Customers" subtitle="Manage customer accounts">
        <template #right>
          <button class="btn-primary" type="button" @click="onClickNew">
            {{
              showForm && !isEditing
                ? 'Close Form'
                : isEditing
                  ? 'Editing...'
                  : 'Create Customer'
            }}
          </button>
        </template>
      </PageHeader>
  
      <FilterBar>
        <input
          v-model="search"
          class="search-input"
          placeholder="Search customers..."
        />
        <div class="pill">
          Showing <strong>{{ filteredCount }}</strong> / <strong>{{ total }}</strong>
        </div>
      </FilterBar>
  
      <CustomerForm
        v-if="showForm"
        :title="isEditing ? 'Edit Customer' : 'New Customer'"
        :submitLabel="isEditing ? 'Update Customer' : 'Create Customer'"
        :busyLabel="isEditing ? 'Updating…' : 'Saving…'"
        :submitting="submitting"
        :error="formError"
        @submit="handleSubmit"
        @cancel="closeForm"
      >
        <div class="category-form__row">
          <label class="category-form__label">Name *</label>
          <input v-model="formName" class="category-form__input" placeholder="e.g. John Doe" />
        </div>
  
        <div class="category-form__row">
          <label class="category-form__label">Phone *</label>
          <input v-model="formPhone" class="category-form__input" placeholder="e.g. 09xxxxxxxx" />
        </div>
  
        <div class="category-form__row">
          <label class="category-form__label">Address *</label>
          <input v-model="formAddress" class="category-form__input" placeholder="e.g. Bangkok" />
        </div>
  
        <div class="category-form__row">
          <label class="category-form__label">Role *</label>
          <input v-model="formRole" class="category-form__input" placeholder="e.g. Admin / Staff / Customer" />
        </div>
  
        <!-- ✅ gmail optional -->
        <div class="category-form__row">
          <label class="category-form__label">Gmail (optional)</label>
          <input v-model="formGmail" class="category-form__input" placeholder="e.g. someone@gmail.com" />
        </div>
  
        <!-- password required only on create -->
        <div class="category-form__row">
          <label class="category-form__label">
            Password <span v-if="isEditing">(leave blank to keep)</span><span v-else>*</span>
          </label>
          <input
            v-model="formPassword"
            type="password"
            class="category-form__input"
            :placeholder="isEditing ? 'Leave blank to keep' : 'Minimum 6 characters'"
          />
        </div>
      </CustomerForm>
  
      <section v-if="errorMessage" class="panel">
        <div class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ errorMessage }}</span>
        </div>
      </section>
  
      <section v-else-if="isLoading" class="panel">
        <div class="users-empty">Loading customers…</div>
      </section>
  
      <AdminTable
        v-else
        :columns="columns"
        :rows="filteredRows"
        title="All customers"
        :page-size="20"
        :editingId="editingId"
        :rowKey="'id'"
        @page-change="onPageChange"
      >
        <!-- gmail cell -->
        <template #cell-gmail="{ value }">
          <span>{{ value ? value : '-' }}</span>
        </template>
  
        <!-- actions -->
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
  import CustomerForm from '../components/admin/Form.vue'
  import AdminTable, { type TableColumn } from '../components/admin/AdminTable.vue'
  import { useCustomersStore } from '../stores/useCustomersStore'
  import type { CustomerDto } from '../dtos/CustomerDto'
  
  const store = useCustomersStore()
  const { items, loading, error } = storeToRefs(store)
  
  onMounted(() => {
    store.loadCustomers()
  })
  
  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)
  
  const search = ref('')
  
  const filteredRows = computed(() => {
    const term = search.value.trim().toLowerCase()
    if (!term) return items.value
  
    return items.value.filter((c: CustomerDto) => {
      return (
        (c.name ?? '').toLowerCase().includes(term) ||
        (c.phone ?? '').toLowerCase().includes(term) ||
        (c.address ?? '').toLowerCase().includes(term) ||
        (c.role ?? '').toLowerCase().includes(term) ||
        ((c.gmail ?? '').toLowerCase().includes(term))
      )
    })
  })
  
  const total = computed(() => items.value.length)
  const filteredCount = computed(() => filteredRows.value.length)
  
  const columns: TableColumn[] = [
    { key: 'id', label: '#', width: '70px' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone', width: '140px' },
    { key: 'address', label: 'Address' },
    { key: 'role', label: 'Role', width: '120px' },
    { key: 'gmail', label: 'Gmail', width: '220px' },
    { key: 'actions', label: '', width: '160px', align: 'right' }
  ]
  
  function onPageChange(page: number) {
    console.log('Customers page →', page)
  }
  
  /* ----- form state ----- */
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)
  
  const formName = ref('')
  const formPhone = ref('')
  const formAddress = ref('')
  const formRole = ref('')
  const formGmail = ref('') // ✅ optional
  const formPassword = ref('')
  
  const submitting = ref(false)
  const formError = ref<string | null>(null)
  
  function resetForm() {
    formName.value = ''
    formPhone.value = ''
    formAddress.value = ''
    formRole.value = ''
    formGmail.value = ''
    formPassword.value = ''
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
  
  function onClickEdit(row: CustomerDto) {
    showForm.value = true
    isEditing.value = true
    editingId.value = Number(row.id)
  
    formName.value = row.name ?? ''
    formPhone.value = row.phone ?? ''
    formAddress.value = row.address ?? ''
    formRole.value = row.role ?? ''
    formGmail.value = row.gmail ?? '' // ✅ can be empty
    formPassword.value = '' // never prefill password
  
    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  async function handleSubmit() {
    formError.value = null
  
    if (!formName.value.trim() || !formPhone.value.trim() || !formAddress.value.trim() || !formRole.value.trim()) {
      formError.value = 'Name, Phone, Address and Role are required.'
      return
    }
  
    // create requires password
    if (!isEditing.value && !formPassword.value.trim()) {
      formError.value = 'Password is required.'
      return
    }
  
    submitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await store.updateCustomer(editingId.value, {
          name: formName.value.trim(),
          phone: formPhone.value.trim(),
          address: formAddress.value.trim(),
          role: formRole.value.trim(),
          gmail: formGmail.value.trim() || undefined, // ✅ optional
          password: formPassword.value.trim() || undefined // ✅ optional in update
        })
      } else {
        await store.createCustomer({
          name: formName.value.trim(),
          phone: formPhone.value.trim(),
          address: formAddress.value.trim(),
          role: formRole.value.trim(),
          gmail: formGmail.value.trim() || undefined, // ✅ optional
          password: formPassword.value.trim()
        })
      }
  
      closeForm()
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving customer.'
    } finally {
      submitting.value = false
    }
  }
  
  async function onClickDelete(id: number) {
    const ok = window.confirm('Are you sure you want to delete this customer?')
    if (!ok) return
  
    try {
      await store.deleteCustomer(id)
      if (editingId.value === id) closeForm()
    } catch (e: any) {
      alert(e?.message ?? 'Something went wrong while deleting customer.')
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