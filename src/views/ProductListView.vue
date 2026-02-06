<template>
  <div class="plist">
    <div class="plist__head">
      <div>
        <h2 class="plist__title">Products</h2>
        <p class="plist__subtitle">Manage all products available in the system.</p>
      </div>

      <button class="plist__add" type="button" @click="goAdd">+ Add product</button>
    </div>

    <div class="plist__filters">
      <div class="plist__search">
        <span class="plist__icon">🔍</span>
        <input
          v-model="searchTerm"
          class="plist__searchInput"
          type="text"
          placeholder="Search by name, code, collection, color…"
        />
      </div>
    </div>

    <div class="plist__card">
      <div v-if="isLoading" class="plist__loading">Loading…</div>
      <div v-else-if="errorMessage" class="plist__error">{{ errorMessage }}</div>

      <table v-else class="plist__table">
        <thead>
          <tr>
            <th style="width: 70px">ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Stock</th>
            <th style="width: 90px">Qty</th>
            <th>Collection</th>
            <th style="width: 120px">Type</th>
            <th style="width: 170px; text-align: right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="8" class="plist__empty">No products found.</td>
          </tr>

          <tr v-for="p in paginatedProducts" :key="p.id">
            <td>{{ p.id }}</td>
            <td>{{ p.name }}</td>
            <td>{{ p.code }}</td>
            <td>{{ p.stockStatus }}</td>
            <td>{{ p.qty }}</td>
            <td>{{ p.collection }}</td>
            <td>{{ p.productTypeId }}</td>
            <td style="text-align: right">
              <button class="plist__btn" type="button" @click="goEdit(p.id)">Edit</button>
              <button class="plist__btn plist__btn--danger" type="button" @click="onDelete(p.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="plist__pager" v-if="filteredProducts.length > 0">
        <button
          class="plist__pageBtn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ‹ Prev
        </button>

        <span class="plist__pageNo">{{ currentPage }}</span>

        <button
          class="plist__pageBtn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useProductsStore } from '../stores/useProductsStore'

  const router = useRouter()

  const productsStore = useProductsStore()
  const { items: products, loading, error } = storeToRefs(productsStore)

  const searchTerm = ref('')

  onMounted(() => {
    productsStore.loadProducts()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  const filteredProducts = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return products.value
    return products.value.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.collection.toLowerCase().includes(term) ||
        p.color.toLowerCase().includes(term)
    )
  })

  const pageSize = ref(10)
  const currentPage = ref(1)

  watch(filteredProducts, () => {
    currentPage.value = 1
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value))
  )

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    if (page < 1) return
    if (page > totalPages.value) return
    currentPage.value = page
  }

  const goAdd = () => {
    router.push('/admin/products/new')
  }

  const goEdit = (id: number) => {
    router.push(`/admin/products/${id}/edit`)
  }

  const onDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this product?')
    if (!ok) return

    try {
      await productsStore.deleteProduct(id)
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete product.')
    }
  }
</script>

<style scoped>
  .plist {
    padding: 18px 18px 30px;
  }

  .plist__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .plist__title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
  }

  .plist__subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #64748b;
  }

  .plist__add {
    border: none;
    border-radius: 14px;
    padding: 10px 14px;
    font-weight: 800;
    cursor: pointer;
    background: #1952e1;
    color: #ffffff;
  }

  .plist__add:hover {
    background: #201dd5b3;
    border-color: #201dd5b3;
  }

  .plist__filters {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .plist__search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #e7eaf5;
    border-radius: 16px;
    padding: 10px 12px;
  }

  .plist__icon {
    font-size: 14px;
    opacity: 0.75;
  }

  .plist__searchInput {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
  }

  .plist__card {
    background: #ffffff;
    border: 1px solid #e7eaf5;
    border-radius: 18px;
    padding: 12px;
  }

  .plist__loading,
  .plist__error {
    padding: 12px;
    font-size: 14px;
  }

  .plist__error {
    color: #dc2626;
  }

  .plist__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .plist__table th {
    text-align: left;
    font-size: 12px;
    color: #64748b;
    font-weight: 800;
    padding: 10px 12px;
    border-bottom: 1px solid #eef2ff;
    background: #f8fafc;
  }

  .plist__table td {
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #0f172a;
  }

  .plist__empty {
    text-align: center;
    padding: 20px;
    color: #64748b;
  }

  .plist__btn {
    border: 1px solid #cbd5e1;
    background: #ffffff;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 800;
    font-size: 13px;
    margin-left: 6px;
  }

  .plist__btn--danger {
    border-color: #fecaca;
    background: #fff1f2;
    color: #b91c1c;
  }

  .plist__pager {
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
    padding: 12px 8px 4px;
  }

  .plist__pageBtn {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: 6px 10px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 800;
    font-size: 13px;
  }

  .plist__pageBtn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .plist__pageNo {
    display: inline-flex;
    min-width: 34px;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 10px;
    background: #2563eb;
    color: #ffffff;
    font-weight: 900;
  }
</style>
