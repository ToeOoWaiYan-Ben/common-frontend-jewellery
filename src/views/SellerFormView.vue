<template>
  <section>
    <div class="users-header">
      <div>
        <h2 class="page-title">Seller Form</h2>
        <p class="users-meta">Register and manage sellers.</p>
      </div>
      <RouterLink to="/" class="users-search__back-link">← Back</RouterLink>
    </div>

    <div class="card" style="margin-bottom: 14px">
      <div v-if="error" class="users-empty users-empty--error" style="margin-bottom: 10px">
        {{ error }}
      </div>

      <div class="category-form">
        <div class="category-form__row">
          <label class="category-form__label">Name *</label>
          <input
            v-model.trim="form.name"
            class="category-form__input"
            placeholder="e.g. John Seller"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label">Phone</label>
          <input
            v-model.trim="form.phone"
            class="category-form__input"
            placeholder="e.g. 09xxxxxxx"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label">Email</label>
          <input
            v-model.trim="form.email"
            class="category-form__input"
            placeholder="e.g. john@gmail.com"
          />
        </div>

        <div class="category-form__row">
          <label class="category-form__label">Address</label>
          <input
            v-model.trim="form.address"
            class="category-form__input"
            placeholder="e.g. Bangkok"
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
            :disabled="store.loading || !form.name"
          >
            {{ store.loading ? 'Saving...' : editingId ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 90px">ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th style="width: 220px; text-align: center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.items.length === 0">
              <td colspan="6">No data.</td>
            </tr>
            <tr
              v-for="s in store.items"
              :key="s.id"
              :class="{ 'row--editing': s.id === editingId }"
            >
              <td>{{ s.id }}</td>
              <td>{{ s.name }}</td>
              <td>{{ s.phone ?? '-' }}</td>
              <td>{{ s.email ?? '-' }}</td>
              <td>{{ s.address ?? '-' }}</td>
              <td style="text-align: center">
                <button class="pagination-btn" @click="edit(s)">Edit</button>
                <button
                  class="pagination-btn"
                  style="border-color: #fecdd3; background: #fff1f2; color: #9f1239"
                  @click="del(s)"
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
  import { onMounted, reactive, ref } from 'vue'
  import { useSellersStore } from '../stores/useSellerStore'
  import type { SellerDto } from '../dtos/SellerDto'

  const store = useSellersStore()
  const editingId = ref<number | null>(null)
  const error = ref<string | null>(null)

  const form = reactive<Omit<SellerDto, 'id'>>({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  onMounted(async () => {
    await store.loadAll()
  })

  function reset() {
    editingId.value = null
    error.value = null
    form.name = ''
    form.phone = ''
    form.email = ''
    form.address = ''
  }

  async function submit() {
    try {
      error.value = null
      const payload = {
        name: form.name.trim(),
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        address: form.address?.trim() || null,
      }
      if (editingId.value) await store.update(editingId.value, payload)
      else await store.create(payload)

      await store.loadAll()
      reset()
    } catch (e: any) {
      error.value = e?.message ?? 'Save failed'
    }
  }

  function edit(s: SellerDto) {
    editingId.value = s.id
    form.name = s.name
    form.phone = s.phone ?? ''
    form.email = s.email ?? ''
    form.address = s.address ?? ''
  }

  async function del(s: SellerDto) {
    if (!confirm(`Delete seller "${s.name}"?`)) return
    await store.remove(s.id)
    await store.loadAll()
    if (editingId.value === s.id) reset()
  }
</script>

<style scoped src="@/styles/admin/admin-table.css"></style>
<style scoped src="@/styles/admin/admin-form.css"></style>

<style scoped>
  .row--editing td {
    background: #e6ffed;
  }
</style>
