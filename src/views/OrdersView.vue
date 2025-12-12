<template>
  <section>
    <!-- Header + search -->
    <div class="users-header">
      <div>
        <h2 class="page-title">Order View</h2>
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
      <div v-if="isLoading" class="users-empty">Loading users…</div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="users-empty users-empty--error">
        {{ errorMessage }}
      </div>

      <!-- Data -->
      <template v-else>
        <table class="table users-table" v-if="filteredUsers.length">
          <thead>
            <tr>
              <th style="width: 60px">#</th>
              <th>Name</th>
              <th>Email</th>
              <th style="width: 140px">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-pill" :class="`role-pill--${user.role.toLowerCase()}`">
                  {{ user.role }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="users-empty">
          No users found for “<span class="users-empty__term">{{ searchTerm }}</span
          >”.
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useUsersStore } from '@/stores/useUsersStore'
  import { storeToRefs } from 'pinia'

  import { computed, ref } from 'vue'
  const searchTerm = ref('')

  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const usersStore = useUsersStore()
  const { items: users, loading, error } = storeToRefs(usersStore)

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
<style scoped src="/public/styles/admin/user.css"></style>
