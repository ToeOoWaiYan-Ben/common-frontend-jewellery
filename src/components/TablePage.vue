<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  total: number
  filteredCount: number
  items: any[]
  pageSize: number
  currentPage: number
  idKey?: string
  isLoading: boolean
  errorMessage: string | null
  showForm: boolean
  primaryButtonLabel: string
  editingId?: number | null
}>()

const emit = defineEmits<{
  (e: 'click-new'): void
  (e: 'change-page', page: number): void
}>()

const idKey = computed(() => props.idKey ?? 'id')

const totalPages = computed(() =>
  props.filteredCount === 0 ? 1 : Math.ceil(props.filteredCount / props.pageSize)
)

const pagesToShow = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const maxButtons = 5

  if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1)

  let start = current - Math.floor(maxButtons / 2)
  let end = current + Math.floor(maxButtons / 2)

  if (start < 1) {
    start = 1
    end = maxButtons
  } else if (end > total) {
    end = total
    start = total - maxButtons + 1
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  emit('change-page', page)
}
</script>

<template>
  <section>
    <!-- Page Header -->
    <div class="users-header">
      <div>
        <h2 class="page-title">{{ title }}</h2>
        <p class="users-meta">
          Showing <strong>{{ filteredCount }}</strong> of <strong>{{ total }}</strong>
          {{ title.toLowerCase() }}
        </p>
      </div>

      <div class="users-header__actions">
        <button class="btn-primary" type="button" @click="$emit('click-new')">
          {{ primaryButtonLabel }}
        </button>
      </div>
    </div>

    <!-- ✅ FORM PANEL (separate) -->
    <div v-if="showForm" class="panel panel--form">
      <div class="panel__header">
        <h3 class="panel__title">{{ props.editingId ? 'Edit' : 'New' }} {{ title }}</h3>
        <p class="panel__subtitle">Fill the form and click save.</p>
      </div>

      <div class="panel__body">
        <div class="category-form">
          <slot name="form"></slot>
        </div>
      </div>
    </div>

    <!-- ✅ LIST PANEL (separate) -->
    <div class="panel panel--list">
      <div class="panel__header panel__header--row">
        <div>
          <h3 class="panel__title">{{ title }} List</h3>
          <p class="panel__subtitle">Search and manage your data.</p>
        </div>

        <div class="panel__actions">
          <slot name="search"></slot>
        </div>
      </div>

      <div class="panel__body">
        <div v-if="errorMessage" class="alert alert--error">
          <span class="alert__icon">⚠</span>
          <span>{{ errorMessage }}</span>
        </div>

        <div v-else-if="isLoading" class="users-empty">
          Loading {{ title.toLowerCase() }}…
        </div>

        <template v-else>
          <div class="table-pagination" v-if="filteredCount > 0">
            <div class="table-pagination__info">
              Page {{ currentPage }} of {{ totalPages }}
              <span>
                • {{ filteredCount }} result<span v-if="filteredCount > 1">s</span>
              </span>
            </div>

            <div class="table-pagination__buttons">
              <button
                class="btn-page"
                type="button"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                ‹ Prev
              </button>

              <button
                v-for="page in pagesToShow"
                :key="page"
                class="btn-page"
                :class="{ 'btn-page--active': page === currentPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>

              <button
                class="btn-page"
                type="button"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                Next ›
              </button>
            </div>
          </div>

          <table class="table users-table table--nice" v-if="items.length">
            <thead>
              <tr><slot name="columns"></slot></tr>
            </thead>

            <tbody>
              <tr
                v-for="item in items"
                :key="item[idKey]"
                :class="{ 'row--editing': props.editingId != null && item[idKey] === props.editingId }"
              >
                <slot name="rows" :item="item"></slot>
              </tr>
            </tbody>
          </table>

          <div v-else class="users-empty">
            No {{ title.toLowerCase() }} found.
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
