<template>
  <TablePage
    title="Users"
    :total="totalUsers"
    :filteredCount="filteredCount"
    :items="paginatedUsers"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New User'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="category-form" @submit.prevent="handleSubmitForm">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit User' : 'New User' }}
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
            class="category-form__input"
            type="text"
            required
            placeholder="e.g. Aung Khant"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="email">Email *</label>
          <input
            id="email"
            v-model="formEmail"
            class="category-form__input"
            type="email"
            required
            placeholder="e.g. ak@gmail.com"
          />
        </div>

        <!-- Password: required on create, optional on edit -->
        <div class="category-form__row">
          <label class="category-form__label" for="password">
            Password {{ isEditing ? '(leave blank to keep same)' : '*' }}
          </label>
          <input
            id="password"
            v-model="formPassword"
            class="category-form__input"
            type="password"
            :required="!isEditing"
            placeholder="••••••••"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="nrc">NRC</label>
          <input
            id="nrc"
            v-model="formNrc"
            class="category-form__input"
            type="text"
            placeholder="e.g. 12/ABC(N)123456"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="phone">Phone</label>
          <input
            id="phone"
            v-model="formPhone"
            class="category-form__input"
            type="text"
            placeholder="e.g. 09xxxxxxx"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label" for="address">Address</label>
          <input
            id="address"
            v-model="formAddress"
            class="category-form__input"
            type="text"
            placeholder="e.g. Bangkok"
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
                  ? 'Update User'
                  : 'Save User'
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
          placeholder="Search by name, email, NRC, phone, address…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Name</th>
      <th>Email</th>
      <th>NRC</th>
      <th>Phone</th>
      <th>Address</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.email }}</td>
      <td>{{ item.nrc ?? '-' }}</td>
      <td>{{ item.phone ?? '-' }}</td>
      <td>{{ item.address ?? '-' }}</td>
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
  import { useUsersStore } from '../stores/useUsersStore'
  import type { UserDto } from '../dtos/UserDto'

  const usersStore = useUsersStore()
  const { items: users, loading, error } = storeToRefs(usersStore)

  const searchTerm = ref('')

  onMounted(() => {
    usersStore.loadUsers()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // filter
  const filteredUsers = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return users.value

    return users.value.filter((u) => {
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.nrc ?? '').toLowerCase().includes(term) ||
        (u.phone ?? '').toLowerCase().includes(term) ||
        (u.address ?? '').toLowerCase().includes(term)
      )
    })
  })

  const totalUsers = computed(() => users.value.length)
  const filteredCount = computed(() => filteredUsers.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredUsers, () => {
    currentPage.value = 1
  })

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredUsers.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  // form state
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formEmail = ref('')
  const formPassword = ref('')
  const formNrc = ref('')
  const formPhone = ref('')
  const formAddress = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const resetForm = () => {
    formName.value = ''
    formEmail.value = ''
    formPassword.value = ''
    formNrc.value = ''
    formPhone.value = ''
    formAddress.value = ''
    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
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

  const onClickEdit = (user: UserDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = user.id

    formName.value = user.name
    formEmail.value = user.email
    formPassword.value = '' // keep blank for "no change"
    formNrc.value = user.nrc ?? ''
    formPhone.value = user.phone ?? ''
    formAddress.value = user.address ?? ''

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim() || !formEmail.value.trim()) {
      formError.value = 'Name and Email are required.'
      return
    }

    if (!isEditing.value && !formPassword.value) {
      formError.value = 'Password is required for new user.'
      return
    }

    const payload: Omit<UserDto, 'id'> = {
      name: formName.value.trim(),
      email: formEmail.value.trim(),
      password: formPassword.value ? formPassword.value : undefined,
      nrc: formNrc.value.trim() || null,
      phone: formPhone.value.trim() || null,
      address: formAddress.value.trim() || null,
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await usersStore.updateUser(editingId.value, payload)
      } else {
        await usersStore.createUser(payload)
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save user.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this user?')
    if (!ok) return

    try {
      await usersStore.deleteUser(id)

      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete user.')
    }
  }
</script>
