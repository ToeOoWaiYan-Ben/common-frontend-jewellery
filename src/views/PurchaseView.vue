<template>
  <div class="purchase">

    <!-- TITLE -->
    <h1 class="purchase__title">
      Products Purchase
    </h1>

    <div class="purchase__grid">

      <!-- LEFT COLUMN -->
      <div>

        <!-- CUSTOMER CARD -->
        <div class="card">
          <h3 class="card__title">Customer:</h3>

          <input
            class="input"
            placeholder="Search by phone or name"
          />

          <div class="field">Name:</div>
          <div class="field">Phone:</div>
          <div class="field">Address:</div>
        </div>

        <!-- ITEMS LIST -->
        <div class="card mt">
          <h3 class="card__title">Items List</h3>

          <table v-if="selectedProducts.length" class="table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Product</th>
                <th>Code</th>
                <th>Weight</th>
                <th>Basic Price</th>
                <th>Depreciation %</th>
                <th>Qty</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in selectedProducts"
                :key="item.id"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.code }}</td>

                <!-- Weight -->
                <td>{{ Number(item.weight || 0).toFixed(2) }} g</td>

                <!-- Basic Price = making_cost -->
                <td>${{ Number(item.making_cost || 0).toFixed(2) }}</td>

                <!-- Depreciation -->
                <td>{{ Number(item.depreciation || 0).toFixed(2) }}%</td>

                <!-- Qty -->
                <td>
                  <input
                    type="number"
                    v-model.number="item.purchase_qty"
                    min="1"
                    class="qty"
                  />
                </td>

                <!-- Total Amount -->
                <td>
                  ${{ calculateItemTotal(item).toFixed(2) }}
                </td>

                <td>
                  <button
                    class="icon-btn"
                    @click="removeProduct(index)"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="empty">
            No items added.
          </div>

          <button
            v-if="selectedProducts.length"
            class="clear-btn"
            @click="selectedProducts = []"
          >
            Clear All
          </button>
        </div>

      </div>

      <!-- CENTER COLUMN -->
      <div>
        <div class="card">
          <h3 class="card__title">Add Product</h3>

          <div class="search-wrapper" ref="searchBox">
            <input
              v-model="search"
              @focus="showDropdown = true"
              class="input"
              placeholder="Search product by code or name"
            />

            <div v-if="showDropdown" class="dropdown">
              <div
                v-for="p in filteredProducts"
                :key="p.id"
                class="dropdown-item"
                @click="selectProduct(p)"
              >
                <strong>{{ p.name }}</strong>
                <span>({{ p.code }})</span>
              </div>

              <div
                v-if="filteredProducts.length === 0"
                class="empty"
              >
                No products found.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div>
        <div class="card summary">
          <h3 class="card__title">Summary</h3>

          <div class="summary-row">
            <span>Subtotal:</span>
            <strong>${{ subtotal.toFixed(2) }}</strong>
          </div>

          <div class="summary-row">
            <span>Discount:</span>
            <input
              type="number"
              v-model.number="discount"
              class="qty"
              min="0"
            />
          </div>

          <div class="summary-row total">
            <span>Total:</span>
            <strong>${{ finalTotal.toFixed(2) }}</strong>
          </div>

          <button class="btn primary">
            Complete Purchase
          </button>

          <button class="btn">
            Print Invoice
          </button>
          
          
        </div>

        <button class="btn" @click="goToList">
  View Purchase List
</button>
      </div>
      

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '../stores/useProductsStore'
import { useRouter } from 'vue-router'

const productsStore = useProductsStore()
const { items: products } = storeToRefs(productsStore)
const router = useRouter()
const search = ref('')
const showDropdown = ref(false)
const selectedProducts = ref<any[]>([])
const discount = ref(0)
const searchBox = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!products.value.length) {
    await productsStore.loadProducts()
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  if (searchBox.value && !searchBox.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

const goToList = () => {                // ✅ ADDED
  router.push('/purchase-list')
}

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return products.value

  return products.value.filter((p: any) =>
    String(p.name ?? '').toLowerCase().includes(term) ||
    String(p.code ?? '').toLowerCase().includes(term)
  )
})

const selectProduct = (product: any) => {
  const exists = selectedProducts.value.find(p => p.id === product.id)
  if (exists) return

  selectedProducts.value.push({
    ...product,
    purchase_qty: 1
  })

  search.value = ''
  showDropdown.value = false
}

const removeProduct = (index: number) => {
  selectedProducts.value.splice(index, 1)
}

/* ===== ITEM TOTAL =====
   Formula:
   (making_cost - depreciation%) × qty
*/
const calculateItemTotal = (item: any) => {
  const makingCost = Number(item.making_cost || 0)
  const depreciation = Number(item.depreciation || 0)

  const afterDep =
    makingCost - (makingCost * depreciation / 100)

  return afterDep * item.purchase_qty
}

const subtotal = computed(() =>
  selectedProducts.value.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  )
)

const finalTotal = computed(() => {
  const total = subtotal.value - discount.value
  return total < 0 ? 0 : total
})
</script>

<style scoped>
/* Your same CSS — unchanged */
.purchase {
  padding: 30px;
  background: #f3f4f6;
  min-height: 100vh;
}

.purchase__title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 25px;
}

.purchase__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.9fr;
  gap: 20px;
}

.card {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 18px;
}

.card__title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.mt {
  margin-top: 20px;
}

.input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  margin-bottom: 10px;
}

.field {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.qty {
  width: 70px;
  padding: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.clear-btn {
  margin-top: 10px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
}

.search-wrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  width: 100%;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-item {
  padding: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.dropdown-item:hover {
  background: #f1f5f9;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
}

.btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
}

.btn.primary {
  background: #6b7280;
  color: white;
  border: none;
}

.empty {
  padding: 10px;
  color: #6b7280;
}
</style>