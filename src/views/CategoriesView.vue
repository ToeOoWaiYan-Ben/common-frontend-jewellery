<template>
    <section>
      <!-- Header + search -->
      <div class="users-header">
        <div>
          <h2 class="page-title">Categories</h2>
          <p class="users-meta">
            Showing
            <strong>{{ filteredCount }}</strong>
            of
            <strong>{{ totalCategories }}</strong>
            categories
          </p>
        </div>
  
        <div class="users-search">
          <span class="users-search__icon">🔍</span>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by name, code or description…"
            class="users-search__input"
          />
        </div>
      </div>
  
      <!-- Card / state handling -->
      <div class="card">
  
        <!-- LOADING -->
        <div v-if="isLoading" class="users-empty">
          Loading categories…
        </div>
  
        <!-- ERROR -->
        <div v-else-if="errorMessage" class="users-empty users-empty--error">
          {{ errorMessage }}
        </div>
  
        <!-- CATEGORY LIST -->
        <div v-else>
          <div v-if="filteredCategories.length" class="category-list">
            <div 
              v-for="category in filteredCategories" 
              :key="category.id"
              class="category-item"
            >
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-desc">{{ category.description }}</p>
            </div>
          </div>
  
          <!-- EMPTY RESULT -->
          <div v-else class="users-empty">
            No categories found for 
            “<span class="users-empty__term">{{ searchTerm }}</span>”.
          </div>
        </div>
  
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useCategoriesStore } from '../stores/useCategoriesStore'
  
  const searchTerm = ref('')
  
  // Pinia store
  const categoriesStore = useCategoriesStore()
  const { items: categories, loading, error } = storeToRefs(categoriesStore)
  
  onMounted(() => {
    categoriesStore.loadCategories()
    console.log('CategoriesView mounted, loadCategories called!')
  })
  
  // Loading & error from store
  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)
  
  // --- Filters & meta ---
  const filteredCategories = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return categories.value
  
    return categories.value.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        (c.description?.toLowerCase().includes(term) ?? false)
      )
    })
  })
  
  const totalCategories = computed(() => categories.value.length)
  const filteredCount = computed(() => filteredCategories.value.length)
  </script>
  
  <style scoped src="/public/styles/admin/category.css"></style>