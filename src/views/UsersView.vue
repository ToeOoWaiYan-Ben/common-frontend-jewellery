<template>
  <section>
    <!-- Header + create button -->
    <div class="users-header">
      <div>
        <h2 class="page-title">Users</h2>
        <p class="users-meta">
          Showing
          <strong>{{ filteredCount }}</strong>
          of
          <strong>{{ totalUsers }}</strong>
          users
        </p>
      </div>

      <div class="users-header__actions">
        <button class="btn-primary" type="button" @click="onClickNew">
          {{ showForm && !isEditing ? 'Close Form' : 'Create New User' }}
        </button>
      </div>
    </div>

    <!-- Card -->
    <div class="card">
      <!-- Inline form (Create + Update) -->
      <div v-if="showForm" class="category-form">
        <h3 class="category-form__title">
          {{ isEditing ? 'Edit User' : 'New User' }}
        </h3>

        <p v-if="formError" class="users-empty users-empty--error">
          {{ formError }}
        </p>

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
            placeholder="e.g. 0912345678"
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
          <label class="category-form__label" for="password">Password *</label>
          <input
            id="password"
            v-model="formPassword"
            type="password"
            class="category-form__input"
            placeholder="Enter a secure password"
            required
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
                  ? 'Update User'
                  : 'Save User'
            }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="users-empty">
        Loading users…
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="users-empty users-empty--error">
        {{ errorMessage }}
      </div>

      <!-- Search + table -->
      <template v-else>
        <!-- Search bar -->
        <div class="users-search">
          <span class="users-search__icon">🔍</span>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by name, phone, address or role…"
            class="users-search__input"
          />
        </div>

        <!-- Table -->
        <table class="table users-table" v-if="filteredUsers.length">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th style="width: 190px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.address }}</td>
              <td>{{ user.role }}</td>

              <td>
                <div style="display: flex; gap: 0.25rem;">
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="onClickEdit(user)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="btn-secondary"
                    style="color: #b91c1c; border-color: #fecaca; background-color: #fef2f2;"
                    @click="onClickDelete(user.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="users-empty">
          No users found for
          “<span class="users-empty__term">{{ searchTerm }}</span>”.
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '../stores/useUsersStore'
import type { UserDto } from '../dtos/UserDto'

const searchTerm = ref('')

const usersStore = useUsersStore()
const { items: users, loading, error } = storeToRefs(usersStore)

onMounted(() => {
  usersStore.loadUsers()
  console.log('Users onMounted call!!!')
})

const isLoading = computed(() => loading.value)
const errorMessage = computed(() => error.value)

const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return users.value

  return users.value.filter((u) => {
    return (
      u.name.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term) ||
      u.address.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    )
  })
})

const totalUsers = computed(() => users.value.length)
const filteredCount = computed(() => filteredUsers.value.length)

// ---- inline form state ----
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const formName = ref('')
const formPhone = ref('')
const formAddress = ref('')
const formRole = ref('')
const formPassword = ref('') // used only on CREATE or when changing password

const isSubmitting = ref(false)
const formError = ref<string | null>(null)

const resetForm = () => {
  formName.value = ''
  formPhone.value = ''
  formAddress.value = ''
  formRole.value = ''
  formPassword.value = ''
  formError.value = null
  isEditing.value = false
  editingId.value = null
}

const onClickNew = () => {
  // open in Create mode
  resetForm()
  isEditing.value = false
  showForm.value = !showForm.value
}

const onClickEdit = (user: UserDto) => {
  console.log('Edit clicked for', user)
  showForm.value = true
  isEditing.value = true
  editingId.value = user.id

  formName.value = user.name
  formPhone.value = user.phone
  formAddress.value = user.address
  formRole.value = user.role
  formPassword.value = '' // do not prefill password for security

  formError.value = null
}

const handleSubmitForm = async () => {
  formError.value = null

  // basic required checks
  if (
    !formName.value.trim() ||
    !formPhone.value.trim() ||
    !formAddress.value.trim() ||
    !formRole.value.trim()
  ) {
    formError.value = 'Name, Phone, Address and Role are required.'
    return
  }

  // Password required on CREATE, optional on EDIT
  if (!isEditing.value && !formPassword.value.trim()) {
    formError.value = 'Password is required when creating a new user.'
    return
  }

  isSubmitting.value = true
  try {
    if (isEditing.value && editingId.value != null) {
      // UPDATE (without password, unless you design update to change it too)
      await usersStore.updateUser(editingId.value, {
        name: formName.value.trim(),
        phone: formPhone.value.trim(),
        address: formAddress.value.trim(),
        role: formRole.value.trim()
      })
    } else {
      // CREATE
      await usersStore.createUser({
        name: formName.value.trim(),
        phone: formPhone.value.trim(),
        address: formAddress.value.trim(),
        role: formRole.value.trim(),
        hashPassword: formPassword.value.trim()
      })
    }

    resetForm()
    showForm.value = false
  } catch (e: any) {
    console.error('Error saving user', e)
    formError.value =
      e?.message ?? 'Something went wrong while saving the user.'
  } finally {
    isSubmitting.value = false
  }
}

const onClickDelete = async (id: number) => {
  console.log('Delete clicked for id', id)
  const ok = window.confirm('Are you sure you want to delete this user?')
  if (!ok) return

  try {
    await usersStore.deleteUser(id)

    if (isEditing.value && editingId.value === id) {
      resetForm()
      showForm.value = false
    }
  } catch (e: any) {
    console.error('Error deleting user', e)
    alert(
      (e as any)?.message ?? 'Something went wrong while deleting the user.'
    )
  }
}
</script>
<style scoped src="/public/styles/admin/user.css"></style>



