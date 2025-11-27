<template>
  <section>
    <!-- Header + search -->
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

      <div class="users-search">
        <span class="users-search__icon">🔍</span>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search by name, email or role…"
          class="users-search__input"
        />
      </div>
    </div>

    <!-- Card / table / states -->
    <div class="card">
      <!-- Loading -->
      <div v-if="isLoading" class="users-empty">
        Loading users…
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="users-empty users-empty--error">
        {{ errorMessage }}
      </div>

      <!-- Data -->
      <template v-else>
        <table class="table users-table" v-if="filteredUsers.length">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th>Name</th>
              <th>Email</th>
              <th style="width: 140px;">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span
                  class="role-pill"
                  :class="`role-pill--${user.role.toLowerCase()}`"
                >
                  {{ user.role }}
                </span>
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

interface User {
  id: number
  name: string
  email: string
  role: string
}

// --- State ---
const users = ref<User[]>([])
const searchTerm = ref('')

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// --- Fetch users from API ---
const loadUsers = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await fetch('http://localhost:8080/api/customers')

    if (!res.ok) {
      throw new Error(`Failed to fetch users (${res.status})`)
    }

    const data = (await res.json()) as User[]

    // You can map/transform here if backend field names are different
    users.value = data
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Something went wrong while loading users.'
  } finally {
    isLoading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadUsers()
})

// --- Filters & meta ---
const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return users.value

  return users.value.filter((u) => {
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    )
  })
})

const totalUsers = computed(() => users.value.length)
const filteredCount = computed(() => filteredUsers.value.length)
</script>

<style scoped>
/* Header row */
.users-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.users-meta {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Search bar */
.users-search {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  max-width: 260px;
  width: 100%;
}

.users-search__icon {
  font-size: 0.9rem;
  color: #9ca3af;
}

.users-search__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  outline: none;
}

/* Table styling */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table th,
.table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.table thead th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.users-table tbody tr:hover {
  background-color: #f9fafb;
}

/* Role pill */
.role-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.role-pill--admin {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.role-pill--editor {
  background-color: #ecfdf3;
  color: #15803d;
  border-color: #bbf7d0;
}

.role-pill--viewer {
  background-color: #fefce8;
  color: #a16207;
  border-color: #fef08a;
}

/* empty state */
.users-empty {
  padding: 1.25rem 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.users-empty--error {
  color: #b91c1c;
}

.users-empty__term {
  font-weight: 500;
}

/* responsive */
@media (max-width: 640px) {
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }

  .users-search {
    max-width: 100%;
  }
}
</style>
