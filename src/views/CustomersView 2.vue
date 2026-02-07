<template>
  <TablePage
    title="Customers"
    :total="customers.length"
    :filteredCount="filtered.length"
    :items="paginated"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    primaryButtonLabel="Create New Customer"
    idKey="id"
    @click-new="onClickNew"
    @change-page="goToPage"
    :editingId="editingId"
  >
    <!-- FORM -->
    <template #form>
      <h3>{{ isEditing ? 'Edit Customer' : 'New Customer' }}</h3>

      <div v-if="formError" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ formError }}</span>
      </div>

      <!-- Name -->
      <div class="category-form__row">
        <label class="category-form__label" for="name">Name *</label>
        <input
          id="name"
          v-model.trim="form.name"
          class="category-form__input"
          type="text"
          required
          placeholder="e.g. Su Myat Noe"
        />
      </div>

      <!-- Phone -->
      <div class="category-form__row">
        <label class="category-form__label" for="phone">Phone *</label>
        <input
          id="phone"
          v-model.trim="form.phone"
          class="category-form__input"
          type="text"
          required
          placeholder="e.g. 09xxxxxxxxx"
        />
      </div>

      <!-- Email -->
      <div class="category-form__row">
        <label class="category-form__label" for="email">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          class="category-form__input"
          type="email"
          placeholder="optional"
        />
      </div>

      <!-- Address -->
      <div class="category-form__row">
        <label class="category-form__label" for="address">Address</label>
        <textarea
          id="address"
          v-model.trim="form.address"
          class="category-form__input category-form__textarea"
          rows="3"
          placeholder="optional"
        ></textarea>
      </div>

      <!-- Customer Type -->
      <div class="category-form__row">
        <label class="category-form__label" for="customerType">Customer Type *</label>
        <select id="customerType" v-model="form.customerType" class="category-form__input" required>
          <option value="REGULAR">Regular</option>
          <option value="VIP">VIP</option>
          <option value="WHOLESALE">Wholesale</option>
        </select>
      </div>

      <!-- Status -->
      <div class="category-form__row">
        <label class="category-form__label" for="status">Status *</label>
        <select id="status" v-model="form.status" class="category-form__input" required>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BLACKLISTED">Blacklisted</option>
        </select>
      </div>

      <button class="btn-secondary" type="button" @click="submit">
        {{ isEditing ? 'Update' : 'Create' }}
      </button>
    </template>

    <!-- TABLE -->
    <template #columns>
      <th>#</th>
      <th>Name</th>
      <th>Phone</th>
      <th>Type</th>
      <th>Status</th>
      <th>Actions</th>
    </template>

    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.phone }}</td>
      <td>{{ item.customerType }}</td>
      <td>{{ item.status }}</td>
      <td>
        <button class="btn-secondary btn-secondary--danger" type="button" @click="edit(item)">
          Edit
        </button>
        <button class="btn-secondary btn-secondary--danger" type="button" @click="remove(item.id)">
          Delete
        </button>
      </td>
    </template>
  </TablePage>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useCustomersStore } from '../stores/useCustomersStore'
  import TablePage from '../components/TablePage.vue'
  import type { CustomerDto } from '../dtos/CustomerDto'

  const store = useCustomersStore()

  onMounted(() => store.loadCustomers())

  const isLoading = computed(() => store.loading)
  const errorMessage = computed(() => store.error)

  // ✅ customers list (from store)
  const customers = computed(() => store.items)

  // ✅ pagination + filter like your Categories page
  const pageSize = ref(20)
  const currentPage = ref(1)

  const filtered = computed(() => customers.value) // (no search yet)
  watch(filtered, () => (currentPage.value = 1))

  const totalPages = computed(() => {
    const count = filtered.value.length
    return count === 0 ? 1 : Math.max(1, Math.ceil(count / pageSize.value))
  })

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filtered.value.slice(start, end)
  })

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  // ✅ form state
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  type CustomerForm = Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt'>

  const blankForm = (): CustomerForm => ({
    name: '',
    phone: '',
    email: '',
    address: '',
    customerType: 'REGULAR',
    status: 'ACTIVE',
  })

  const form = reactive<CustomerForm>(blankForm())
  const formError = ref<string | null>(null)

  function onClickNew() {
    showForm.value = !showForm.value
    isEditing.value = false
    editingId.value = null
    Object.assign(form, blankForm())
    formError.value = null
  }

  function edit(c: CustomerDto) {
    showForm.value = true
    isEditing.value = true
    editingId.value = c.id
    formError.value = null

    // ✅ assign only editable fields
    Object.assign(form, {
      name: c.name ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      customerType: c.customerType ?? 'REGULAR',
      status: c.status ?? 'ACTIVE',
    })
  }

  async function submit() {
    formError.value = null

    if (!form.name?.trim() || !form.phone?.trim()) {
      formError.value = 'Name and phone are required'
      return
    }

    const payload: CustomerForm = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || undefined,
      address: form.address?.trim() || undefined,
    }

    if (isEditing.value && editingId.value != null) {
      await store.updateCustomer(editingId.value, payload)
    } else {
      await store.createCustomer(payload)
    }

    showForm.value = false
    isEditing.value = false
    editingId.value = null
    Object.assign(form, blankForm())
  }

  async function remove(id: number) {
    if (!confirm('Delete this customer?')) return
    await store.deleteCustomer(id)
  }
</script>

<style scoped src="@/styles/admin/admin-form.css"></style>
<style scoped src="@/styles/admin/admin-table.css"></style>
