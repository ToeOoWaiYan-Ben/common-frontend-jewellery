<template>
  <section class="panel admin-table-panel">
    <div class="panel-header" v-if="title">
      <h2 class="panel-title">{{ title }}</h2>
      <span class="panel-caption">
        {{ totalItems }} items · page {{ currentPage }} / {{ totalPages }}
      </span>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width || 'auto', textAlign: col.align || 'left' }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="pagedRows.length === 0">
            <td :colspan="columns.length">No data.</td>
          </tr>

          <tr
            v-for="row in pagedRows"
            :key="getRowKey(row)"
            :class="{ 'row--editing': editingId != null && Number(row.id) === Number(editingId) }"
          >
            <td v-for="col in columns" :key="col.key" :style="{ textAlign: col.align || 'left' }">
              <slot :name="'cell-' + col.key" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        ‹ Prev
      </button>

      <button
        v-for="page in pageNumbers"
        :key="page"
        class="pagination-btn"
        :class="{ 'pagination-btn--active': page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next ›
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  export type TableColumn = {
    key: string
    label: string
    width?: string
    align?: 'left' | 'center' | 'right'
  }

  export type TableRow = {
    id?: string | number
    [key: string]: unknown
  }

  const props = defineProps<{
    columns: TableColumn[]
    rows: TableRow[]
    title?: string
    pageSize?: number
    rowKey?: string | ((row: TableRow) => string | number)
    editingId?: string | number | null
  }>()

  const emit = defineEmits<{
    (e: 'page-change', page: number): void
  }>()

  const pageSize = computed(() => props.pageSize ?? 10)
  const currentPage = ref(1)

  const totalItems = computed(() => props.rows.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return props.rows.slice(start, end)
  })

  const pageNumbers = computed(() => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
    return pages
  })

  watch(
    () => props.rows,
    () => {
      currentPage.value = 1
    }
  )

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    emit('page-change', page)
  }

  function getRowKey(row: TableRow): string | number {
    if (typeof props.rowKey === 'function') return props.rowKey(row)
    if (typeof props.rowKey === 'string')
      return (row[props.rowKey] as string | number | undefined) ?? JSON.stringify(row)
    return row.id ?? JSON.stringify(row)
  }
</script>

<style scoped src="@/styles/admin/admin-table.css"></style>
<style scoped>
  /* ✅ Light green editing row */
  .row--editing td {
    background: #e6ffed;
  }
</style>
