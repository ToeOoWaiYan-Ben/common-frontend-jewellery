<!-- src/views/CategoryFormView.vue -->
<template>
  <section>
    <!-- Header -->
    <div class="users-header">
      <div>
        <h2 class="page-title">New Category</h2>
        <p class="users-meta">Create a new category for your products.</p>
      </div>

      <RouterLink to="/categories" class="users-search__back-link">
        ← Back to Categories
      </RouterLink>
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
            placeholder="e.g. Necklaces"
            required
          />
        </div>

        <!-- Code -->
        <div class="category-form__row">
          <label class="category-form__label" for="code">Code *</label>
          <input
            id="code"
            v-model="code"
            type="text"
            class="category-form__input"
            placeholder="e.g. NECK"
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
            placeholder="Optional description for this category…"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="category-form__actions">
          <RouterLink to="/categories" class="btn-secondary" type="button"> Cancel </RouterLink>

          <button class="btn-primary" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving…' : 'Save Category' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCategoriesStore } from '../stores/useCategoriesStore'

  const categoriesStore = useCategoriesStore()
  const router = useRouter()

  const name = ref('')
  const code = ref('')
  const description = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const handleSubmit = async () => {
    formError.value = null

    if (!name.value.trim() || !code.value.trim()) {
      formError.value = 'Name and Code are required.'
      return
    }

    isSubmitting.value = true

    try {
      await categoriesStore.createCategory({
        name: name.value.trim(),
        code: code.value.trim(),
        description: description.value.trim() || undefined,
      })

      // if needed: await categoriesStore.loadCategories()

      // Go back to categories page
      router.push('/categories')
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while creating the category.'
    } finally {
      isSubmitting.value = false
    }
  }
</script>
