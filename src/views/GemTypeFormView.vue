<template>
  <section>
    <!-- Header -->
    <div class="users-header">
      <div>
        <h2 class="page-title">Gem Type Form</h2>
        <p class="users-meta">Create and manage gem types (one-to-many with packages).</p>
      </div>

      <RouterLink to="/" class="users-search__back-link"> ← Back </RouterLink>
    </div>

    <!-- Form card -->
    <div class="card" style="margin-bottom: 14px">
      <div v-if="store.error" class="users-empty users-empty--error" style="margin-bottom: 10px">
        {{ store.error }}
      </div>

      <div class="category-form">
        <div class="category-form__row">
          <label class="category-form__label">Gem Type Name *</label>
          <input
            v-model.trim="name"
            class="category-form__input"
            placeholder="e.g. Diamond, Ruby, Sapphire"
            :disabled="store.loading"
          />
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px">
          <button class="btn-secondary" type="button" @click="reset" :disabled="store.loading">
            Reset
          </button>

          <button
            class="btn-primary"
            type="button"
            @click="submit"
            :disabled="store.loading || !name"
          >
            {{ store.loading ? 'Saving...' : editingId ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table list -->
    <div class="card">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 12px;
        "
      >
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800">Gem Type List</h3>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b">
            {{ store.items.length }} items
          </p>
        </div>

        <input
          v-model.trim="q"
          class="category-form__input"
          style="max-width: 280px"
          placeholder="Search..."
        />
      </div>

      <div class="table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 90px">ID</th>
              <th>Name</th>
              <th style="width: 200px; text-align: center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="3">No data.</td>
            </tr>

            <tr v-for="x in filtered" :key="x.id" :class="{ 'row--editing': x.id === editingId }">
              <td>{{ x.id }}</td>
              <td>{{ x.name }}</td>
              <td style="text-align: center">
                <button
                  class="pagination-btn"
                  @click="startEdit(x.id, x.name)"
                  :disabled="store.loading"
                >
                  Edit
                </button>
                <button
                  class="pagination-btn"
                  style="border-color: #fecdd3; background: #fff1f2; color: #9f1239"
                  @click="del(x.id, x.name)"
                  :disabled="store.loading"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useGemTypesStore } from '../stores/useGemTypesStore'

  const store = useGemTypesStore()

  const name = ref('')
  const editingId = ref<number | null>(null)
  const q = ref('')

  onMounted(async () => {
    await store.loadAll()
  })

  const filtered = computed(() => {
    const t = q.value.toLowerCase()
    if (!t) return store.items
    return store.items.filter((x) => x.name.toLowerCase().includes(t))
  })

  function reset() {
    name.value = ''
    editingId.value = null
  }

  async function submit() {
    if (!name.value) return

    if (editingId.value) {
      await store.update(editingId.value, name.value)
    } else {
      await store.create(name.value)
    }

    await store.loadAll()
    reset()
  }

  function startEdit(id: number, n: string) {
    editingId.value = id
    name.value = n
  }

  async function del(id: number, n: string) {
    if (!confirm(`Delete gem type "${n}"?`)) return
    await store.remove(id)
    await store.loadAll()
    if (editingId.value === id) reset()
  }
</script>

<style scoped src="@/styles/admin/admin-table.css"></style>
<style scoped src="@/styles/admin/admin-form.css"></style>

<style scoped>
  .row--editing td {
    background: #e6ffed;
  }
</style>
