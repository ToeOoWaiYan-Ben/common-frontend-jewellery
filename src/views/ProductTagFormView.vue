<!-- src/views/ProductTagFormView.vue -->
<template>
  <section>
    <!-- Header -->
    <div class="users-header">
      <div>
        <h2 class="page-title">New Product Tag</h2>
        <p class="users-meta">Create a new tag for products.</p>
      </div>

    </div>

    <!-- Form card -->
    <div class="card">
      <form class="category-form" @submit.prevent="handleSubmit">
        <!-- Error -->
        <p v-if="formError" class="users-empty users-empty--error">
          {{ formError }}
        </p>

        <!-- Name -->
        <div class="category-form__row">
          <label class="category-form__label" for="name">Name *</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="category-form__input"
            placeholder="e.g. Premium"
            required
          />
        </div>

        <!-- Description -->
        <div class="category-form__row">
          <label class="category-form__label" for="description">Description</label>
          <textarea
            id="description"
            v-model="description"
            rows="3"
            class="category-form__input category-form__textarea"
            placeholder="Optional description for this tag…"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="category-form__actions">
          <RouterLink to="/admin/product-tags" class="btn-secondary" type="button">
            Cancel
          </RouterLink>

          <button class="btn-primary" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving…' : 'Save Product Tag' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { http } from '../services/http'

  const router = useRouter()

  const name = ref('')
  const description = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const handleSubmit = async () => {
    formError.value = null

    if (!name.value.trim()) {
      formError.value = 'Name is required.'
      return
    }

    isSubmitting.value = true
    try {
      // ✅ correct: http() function (same pattern as Categories store)
      await http('/product-tags', {
        method: 'POST',
        body: JSON.stringify({
          name: name.value.trim(),
          description: description.value.trim() || null,
        }),
      })

      router.push('/admin/product-tags')
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to create product tag.'
    } finally {
      isSubmitting.value = false
    }
  }
</script>
