<template>
  <section>
    <!-- Top header (title + create button) -->
    <div class="users-header">
      <div>
        <h2 class="page-title">{{ title }}</h2>
        <p class="users-meta">
          Showing
          <strong>{{ filteredCount }}</strong>
          of
          <strong>{{ total }}</strong>
          {{ title.toLowerCase() }}
        </p>
      </div>

      <div class="users-header__actions">
        <button class="btn-primary" type="button" @click="$emit('clickNew')">
          {{ primaryButtonLabel }}
        </button>
      </div>
    </div>

    <!-- Card -->
    <div class="card">
      <!-- Inline form (create / edit) -->
      <div v-if="showForm" class="category-form">
        <slot name="form"></slot>
      </div>

      <!-- Backend error -->
      <div v-if="errorMessage" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Loading -->
      <div v-else-if="isLoading" class="users-empty">Loading {{ title.toLowerCase() }}…</div>

      <!-- Search + table + pagination -->
      <template v-else>
        <!-- Search (provided by parent) -->
        <slot name="search"></slot>

        <!-- Pagination (top) -->
        <div class="table-pagination" v-if="filteredCount > 0">
          <div class="table-pagination__info">
            Page {{ currentPage }} of {{ totalPages }}
            <span> • {{ filteredCount }} result<span v-if="filteredCount > 1">s</span> </span>
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

        <!-- Table -->
        <table class="table users-table" v-if="items.length">
          <thead>
            <tr>
              <slot name="columns"></slot>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item[idKey]"
              :class="{ 'row--editing': editingId != null && item[idKey] === editingId }"
            >
              <slot name="rows" :item="item"></slot>
            </tr>
          </tbody>
        </table>

        <!-- Empty -->
        <div v-else class="users-empty">No {{ title.toLowerCase() }} found.</div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, toRef } from 'vue'

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
    editingId?: number | null // ⭐ NEW: which row is being edited
  }>()

  const emit = defineEmits<{
    (e: 'changePage', page: number): void
    (e: 'clickNew'): void
  }>()

  const idKey = props.idKey ?? 'id'

  // make editingId usable in template (auto-unwrapped)
  const editingId = toRef(props, 'editingId')

  const totalPages = computed(() =>
    props.filteredCount === 0 ? 1 : Math.ceil(props.filteredCount / props.pageSize)
  )

  const pagesToShow = computed(() => {
    const total = totalPages.value
    const current = props.currentPage
    const maxButtons = 5

    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

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
    emit('changePage', page)
  }
</script>

<style scoped>
  .table-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  }

  .table-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .table-card__table {
    width: 100%;
    border-collapse: collapse;
  }

  .table-card__table th,
  .table-card__table td {
    padding: 10px 14px;
    border-bottom: 1px solid #e2e8f0;
  }

  .table-card__table tr:hover td {
    background: #f8fafc;
  }

  .table-pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
  }

  .btn-page {
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }

  .btn-page--active {
    background: #1d4ed8;
    color: white;
    border-color: #1d4ed8;
  }

  /* ⭐ highlight the row being edited */
  .row--editing td {
    background-color: #e6ffed; /* light green */
    transition: background-color 0.2s ease;
  }
</style>
