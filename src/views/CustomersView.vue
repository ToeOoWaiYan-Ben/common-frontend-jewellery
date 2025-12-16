<!-- src/views/CustomersView.vue -->
<template>
    <TablePage
      title="Customers"
      :total="totalCustomers"
      :filteredCount="filteredCount"
      :items="paginatedCustomers"
      :pageSize="pageSize"
      :currentPage="currentPage"
      :isLoading="isLoading"
      :errorMessage="errorMessage"
      :showForm="showForm"
      :primaryButtonLabel="
        showForm && !isEditing
          ? 'Close Form'
          : isEditing
            ? 'Editing...'
            : 'Create New Customer'
      "
      idKey="id"
      :editingId="editingId"
      @changePage="goToPage"
      @clickNew="onClickNew"
    >
      <!-- FORM SLOT -->
      <template #form>
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit Customer' : 'New Customer' }}
        </h3>
  
        <div v-if="formError" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>
  
        <!-- Name -->
        <div class="category-form__row">
          <label class="category-form__label" for="name">Name *</label>
          <input
            id="name"
            v-model="formName"
            type="text"
            class="category-form__input"
            placeholder="e.g. John Doe"
            required
          />
        </div>
  
        <!-- Phone -->
        <div class="category-form__row">
          <label class="category-form__label" for="phone">Phone *</label>
          <input
            id="phone"
            v-model="formPhone"
            type="text"
            class="category-form__input"
            placeholder="e.g. 09xxxxxxxx"
            required
          />
        </div>
  
        <!-- Address -->
        <div class="category-form__row">
          <label class="category-form__label" for="address">Address *</label>
          <input
            id="address"
            v-model="formAddress"
            type="text"
            class="category-form__input"
            placeholder="e.g. Bangkok, Thailand"
            required
          />
        </div>
  
        <!-- Role -->
        <div class="category-form__row">
          <label class="category-form__label" for="role">Role *</label>
          <input
            id="role"
            v-model="formRole"
            type="text"
            class="category-form__input"
            placeholder="e.g. Admin / Staff / Customer"
            required
          />
        </div>
  
        <!-- Password -->
        <div class="category-form__row">
          <label class="category-form__label" for="password">
            Password <span v-if="isEditing">(leave blank to keep)</span>
            <span v-else>*</span>
          </label>
          <input
            id="password"
            v-model="formPassword"
            type="password"
            class="category-form__input"
            :placeholder="isEditing ? 'Leave blank to keep existing password' : 'Minimum 6 characters'"
            :required="!isEditing"
          />
        </div>
  
        <!-- Gmail optional -->
        <div class="category-form__row">
          <label class="category-form__label" for="gmail">Gmail (optional)</label>
          <input
            id="gmail"
            v-model="formGmail"
            type="email"
            class="category-form__input"
            placeholder="e.g. someone@gmail.com"
          />
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
            {{
              isSubmitting
                ? isEditing
                  ? 'Updating…'
                  : 'Saving…'
                : isEditing
                  ? 'Update Customer'
                  : 'Save Customer'
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
            placeholder="Search by name, phone, address, role, gmail…"
            class="users-search__input"
          />
        </div>
      </template>
  
      <!-- COLUMNS SLOT -->
      <template #columns>
        <th style="width: 60px;">#</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Address</th>
        <th>Role</th>
        <th>Gmail</th>
        <th style="width: 190px;">Actions</th>
      </template>
  
      <!-- ROWS SLOT -->
      <template #rows="{ item }">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.phone }}</td>
        <td>{{ item.address }}</td>
        <td>{{ item.role }}</td>
        <td>{{ item.gmail ?? '-' }}</td>
        <td>
          <div style="display: flex; gap: 0.25rem;">
            <button class="btn-secondary" type="button" @click="onClickEdit(item)">
              Edit
            </button>
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
  import type { CustomerDto } from '../dtos/CustomerDto'
  import { useCustomersStore } from '../stores/useCustomersStore'
  
  const searchTerm = ref('')
  
  const customersStore = useCustomersStore()
  const { items: customers, loading, error } = storeToRefs(customersStore)
  
  onMounted(() => {
    customersStore.loadCustomers()
  })
  
  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)
  
  /* -------- Filtered customers -------- */
  const filteredCustomers = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return customers.value
  
    return customers.value.filter((c) => {
      return (
        (c.name ?? '').toLowerCase().includes(term) ||
        (c.phone ?? '').toLowerCase().includes(term) ||
        (c.address ?? '').toLowerCase().includes(term) ||
        (c.role ?? '').toLowerCase().includes(term) ||
        (c.gmail ?? '').toLowerCase().includes(term)
      )
    })
  })
  
  const totalCustomers = computed(() => customers.value.length)
  const filteredCount = computed(() => filteredCustomers.value.length)
  
  /* -------- Pagination -------- */
  const pageSize = ref(20)
  const currentPage = ref(1)
  
  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )
  
  watch(filteredCustomers, () => {
    currentPage.value = 1
  })
  
  const paginatedCustomers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredCustomers.value.slice(start, end)
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
  const formPhone = ref('')
  const formAddress = ref('')
  const formRole = ref('')
  const formPassword = ref('')
  const formGmail = ref('')
  
  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)
  
  const resetForm = () => {
    formName.value = ''
    formPhone.value = ''
    formAddress.value = ''
    formRole.value = ''
    formPassword.value = ''
    formGmail.value = ''
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
  
  const onClickEdit = (customer: CustomerDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = customer.id
  
    formName.value = customer.name ?? ''
    formPhone.value = customer.phone ?? ''
    formAddress.value = customer.address ?? ''
    formRole.value = customer.role ?? ''
    formGmail.value = customer.gmail ?? ''
    formPassword.value = '' // never prefill password
  
    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleSubmitForm = async () => {
    formError.value = null
  
    if (!formName.value.trim() || !formPhone.value.trim() || !formAddress.value.trim() || !formRole.value.trim()) {
      formError.value = 'Name, Phone, Address and Role are required.'
      return
    }
  
    if (!isEditing.value && !formPassword.value.trim()) {
      formError.value = 'Password is required.'
      return
    }
  
    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await customersStore.updateCustomer(editingId.value, {
          name: formName.value.trim(),
          phone: formPhone.value.trim(),
          address: formAddress.value.trim(),
          role: formRole.value.trim(),
          gmail: formGmail.value.trim() || undefined,
          password: formPassword.value.trim() || undefined
        })
      } else {
        await customersStore.createCustomer({
          name: formName.value.trim(),
          phone: formPhone.value.trim(),
          address: formAddress.value.trim(),
          role: formRole.value.trim(),
          gmail: formGmail.value.trim() || undefined,
          password: formPassword.value.trim()
        })
      }
  
      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving the customer.'
    } finally {
      isSubmitting.value = false
    }
  }
  
  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this customer?')
    if (!ok) return
  
    try {
      await customersStore.deleteCustomer(id)
  
      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert((e as any)?.message ?? 'Something went wrong while deleting customer.')
    }
  }
  </script>