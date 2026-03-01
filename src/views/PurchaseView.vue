<template>
  <div class="purchase">
    <h1 class="purchase__title">Products Purchase</h1>

    <div class="purchase__grid">
      <!-- LEFT -->
      <div>
        <!-- CUSTOMER -->
        <div class="card">
          <h3 class="card__title">Customer:</h3>

          <div class="search-wrapper" ref="customerBox">
            <input
              v-model="customerSearch"
              @focus="showCustomerDropdown = true"
              class="input"
              placeholder="Search by phone or name"
            />

            <div v-if="showCustomerDropdown" class="dropdown">
              <div
                v-for="c in filteredCustomers"
                :key="c.id"
                class="dropdown-item"
                @click="selectCustomer(c)"
              >
                <strong>{{ c.name }}</strong>
                <span>({{ c.phone }})</span>
              </div>

              <div v-if="filteredCustomers.length === 0" class="empty">No customers found.</div>
            </div>
          </div>

          <div class="field">Name: {{ selectedCustomer?.name ?? '-' }}</div>
          <div class="field">Phone: {{ selectedCustomer?.phone ?? '-' }}</div>
          <div class="field">Address: {{ selectedCustomer?.address ?? '-' }}</div>

          <button
            v-if="selectedCustomer"
            class="clear-btn"
            type="button"
            @click="clearCustomer"
            style="width: auto; margin-top: 10px"
          >
            Clear Customer
          </button>
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
                <th>Price</th>
                <th>Depreciation %</th>
                <th>Qty</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in selectedProducts" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.code }}</td>
                <td>{{ Number(item.weight || 0).toFixed(2) }} g</td>
                <td>{{ formatMoney(item.finalPrice) }}</td>
                <td>{{ Number(item.depreciation || 0).toFixed(2) }}%</td>

                <td>
                  <input type="number" v-model.number="item.purchase_qty" min="1" class="qty" />
                </td>

                <td>{{ formatMoney(calculateItemTotal(item)) }}</td>

                <td>
                  <button class="icon-btn" type="button" @click="removeProduct(index)">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="empty">No items added.</div>

          <button
            v-if="selectedProducts.length"
            class="clear-btn"
            type="button"
            @click="selectedProducts = []"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- CENTER -->
      <div>
        <div class="card">
          <h3 class="card__title">Add Product</h3>

          <div class="search-wrapper" ref="productBox">
            <input
              v-model="productSearch"
              @focus="showProductDropdown = true"
              class="input"
              placeholder="Search product by code or name"
            />

            <div v-if="showProductDropdown" class="dropdown">
              <div
                v-for="p in filteredProducts"
                :key="p.id"
                class="dropdown-item"
                @click="selectProduct(p)"
              >
                <strong>{{ p.name }}</strong>
                <span>({{ p.code }})</span>
              </div>

              <div v-if="filteredProducts.length === 0" class="empty">No products found.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div>
        <div class="card summary">
          <h3 class="card__title">Summary</h3>

          <div class="summary-row">
            <span>Subtotal:</span>
            <strong>{{ formatMoney(subtotal) }}</strong>
          </div>

          <div class="summary-row">
            <span>Discount (%):</span>
            <input type="number" v-model.number="discount" class="qty" min="0" max="100" />
          </div>

          <div class="summary-row total">
            <span>Total:</span>
            <strong>{{ formatMoney(finalTotal) }}</strong>
          </div>

          <button
            class="btn primary"
            type="button"
            :disabled="!canCompletePurchase || submitting"
            @click="onCompletePurchase"
          >
            {{ submitting ? 'Saving…' : 'Complete Purchase' }}
          </button>

          <button class="btn" type="button">Print Invoice</button>

          <p v-if="!canCompletePurchase" style="margin-top: 10px; color: #ef4444; font-size: 13px">
            Please select a customer and add at least 1 product.
          </p>

          <p v-if="submitError" style="margin-top: 10px; color: #ef4444; font-size: 13px">
            {{ submitError }}
          </p>
        </div>

        <button class="btn" type="button" @click="goToList">View Purchase List</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'

  import { useProductsStore } from '@/stores/useProductsStore'
  import { useGoldPriceHistoryStore } from '@/stores/useGoldPriceHistoryStore'
  import { useCustomersStore } from '@/stores/useCustomersStore'
  import { useInvoicesStore } from '@/stores/useInvoicesStore'

  import type { GoldPurity } from '@/dtos/GoldPriceHistoryDto'
  import type { CustomerDto } from '@/dtos/CustomerDto'
  import type { PurchaseSaveRequestDto } from '@/dtos/InvoiceDto'
  import { finalPrice } from '@/utils/productPricing'

  const router = useRouter()

  // stores
  const productsStore = useProductsStore()
  const { items: products } = storeToRefs(productsStore)

  const goldPriceStore = useGoldPriceHistoryStore()
  const { items: goldPrices } = storeToRefs(goldPriceStore)

  const customersStore = useCustomersStore()
  const { items: customers } = storeToRefs(customersStore)

  const invoicesStore = useInvoicesStore()

  // UI state
  const submitting = ref(false)
  const submitError = ref<string | null>(null)

  const discount = ref(0)

  // product dropdown
  const productSearch = ref('')
  const showProductDropdown = ref(false)
  const selectedProducts = ref<any[]>([])
  const productBox = ref<HTMLElement | null>(null)

  // customer dropdown
  const customerSearch = ref('')
  const showCustomerDropdown = ref(false)
  const selectedCustomer = ref<CustomerDto | null>(null)
  const customerBox = ref<HTMLElement | null>(null)

  onMounted(async () => {
    if (!products.value.length) await productsStore.loadProducts()
    if (!goldPrices.value.length) await goldPriceStore.loadAll()
    if (!customers.value.length) await customersStore.loadCustomers()
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  const handleClickOutside = (event: MouseEvent) => {
    const t = event.target as Node
    if (productBox.value && !productBox.value.contains(t)) showProductDropdown.value = false
    if (customerBox.value && !customerBox.value.contains(t)) showCustomerDropdown.value = false
  }

  // gold price map
  const sellPriceByPurity = computed<Record<GoldPurity, number>>(() => {
    const map: Record<GoldPurity, number> = { K24: 0, K22: 0, K18: 0, K14: 0 }
    for (const r of goldPrices.value) {
      if (r.status === 'ACTIVE') map[r.purity] = Number(r.sellPrice ?? 0)
    }
    return map
  })

  // customers
  const filteredCustomers = computed(() => {
    const term = customerSearch.value.trim().toLowerCase()
    if (!term) return customers.value
    return customers.value.filter((c: any) => {
      return (
        String(c.name ?? '')
          .toLowerCase()
          .includes(term) ||
        String(c.phone ?? '')
          .toLowerCase()
          .includes(term)
      )
    })
  })

  const selectCustomer = (c: CustomerDto) => {
    selectedCustomer.value = c
    customerSearch.value = `${c.name} (${c.phone})`
    showCustomerDropdown.value = false
  }

  const clearCustomer = () => {
    selectedCustomer.value = null
    customerSearch.value = ''
    showCustomerDropdown.value = false
  }

  // products
  const filteredProducts = computed(() => {
    const term = productSearch.value.trim().toLowerCase()
    if (!term) return products.value
    return products.value.filter((p: any) => {
      return (
        String(p.name ?? '')
          .toLowerCase()
          .includes(term) ||
        String(p.code ?? '')
          .toLowerCase()
          .includes(term)
      )
    })
  })

  const selectProduct = (product: any) => {
    const exists = selectedProducts.value.find((p) => p.id === product.id)
    if (exists) return
    selectedProducts.value.push({ ...product, purchase_qty: 1 })
    productSearch.value = ''
    showProductDropdown.value = false
  }

  const removeProduct = (index: number) => {
    selectedProducts.value.splice(index, 1)
  }

  // pricing
  const unitPrice = (item: any) => Number(item.finalPrice ?? 0)

  const calculateItemTotal = (item: any) => {
    const qty = Number(item.purchase_qty ?? 1)
    return unitPrice(item) * qty
  }

  // totals
  const subtotal = computed(() =>
    selectedProducts.value.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  )

  const finalTotal = computed(() => {
    const sub = subtotal.value
    const percent = Number(discount.value ?? 0)

    const discountAmount = sub * (percent / 100)

    const total = sub - discountAmount

    return total < 0 ? 0 : total
  })

  // validation
  const canCompletePurchase = computed(() => {
    return selectedCustomer.value != null && selectedProducts.value.length > 0
  })

  // submit
  const onCompletePurchase = async () => {
    if (!canCompletePurchase.value) return

    submitting.value = true
    submitError.value = null

    try {
      const payload: PurchaseSaveRequestDto = {
        customerId: Number(selectedCustomer.value!.id),
        status: 'CONFIRMED',
        discountAmount: subtotal.value * (Number(discount.value ?? 0) / 100),
        discountPercentage: null,
        items: selectedProducts.value.map((p) => ({
          productId: Number(p.id),
          qty: Number(p.purchase_qty ?? 1),
          sellingPrice: Number(p.finalPrice ?? 0),
        })),
      }

      await invoicesStore.createInvoice(payload)

      // ✅ reset UI (optional but nice)
      selectedProducts.value = []
      clearCustomer()
      discount.value = 0

      // ✅ go list
      router.push('/purchase-list')
    } catch (e: any) {
      submitError.value = e?.message ?? 'Failed to complete purchase.'
    } finally {
      submitting.value = false
    }
  }

  const goToList = () => router.push('/purchase-list')

  // helpers
  function formatMoney(v?: number | null) {
    const n = Number(v ?? 0)
    return (
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
        n
      ) + ' MMK'
    )
  }
</script>

<style scoped>
  /* keep your existing CSS (same as you sent) */
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
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .empty {
    padding: 10px;
    color: #6b7280;
  }
</style>
