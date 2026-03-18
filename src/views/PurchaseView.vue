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
                <th>Original Price</th>
                <th>Promo Price</th>
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
                <td>{{ formatMoney(getPromotionAdjustedPrice(item)) }}</td>
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
            @click="clearAllProducts"
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

          <div class="summary-row promotion-row">
            <span>Promotion:</span>
            <select v-model="selectedPromotionId" class="select-input">
              <option :value="null">No Promotion</option>
              <option v-for="promo in availablePromotions" :key="promo.id" :value="promo.id">
                {{ promo.name }} ({{ formatPercent(promo.discountRate) }})
              </option>
            </select>
          </div>

          <div v-if="selectedPromotion" class="summary-row">
            <span>Promotion Discount:</span>
            <strong>- {{ formatPercent(selectedPromotion.discountRate) }}</strong>
          </div>
          <div v-if="selectedPromotion" class="summary-row">
            <span>Promotion Savings:</span>
            <strong>- {{ formatMoney(promotionDiscountAmount) }}</strong>
          </div>

          <div class="summary-row">
            <span>Extra Discount (%):</span>
            <input type="number" v-model.number="discount" class="qty" min="0" max="100" />
          </div>

          <div v-if="discount > 0" class="summary-row">
            <span>Extra Discount Amount:</span>
            <strong>- {{ formatMoney(extraDiscountAmount) }}</strong>
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

          

          <p v-if="!canCompletePurchase" style="margin-top: 10px; color: #ef4444; font-size: 13px">
          
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
  import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'

  import { useProductsStore } from '@/stores/useProductsStore'
  import { useCustomersStore } from '@/stores/useCustomersStore'
  import { useInvoicesStore } from '@/stores/useInvoicesStore'
  import { usePromotionsStore } from '@/stores/usePromotionsStore'

  import type { CustomerDto } from '@/dtos/CustomerDto'
  import type { PurchaseSaveRequestDto } from '@/dtos/InvoiceDto'

  const router = useRouter()

  // STORES
  const productsStore = useProductsStore()
  const customersStore = useCustomersStore()
  const invoicesStore = useInvoicesStore()
  const promotionsStore = usePromotionsStore()

  const { items: products } = storeToRefs(productsStore)
  const { items: customers } = storeToRefs(customersStore)
  const { items: promotions } = storeToRefs(promotionsStore)

  // UI STATE
  const submitting = ref(false)
  const submitError = ref<string | null>(null)

  const discount = ref(0)

  const selectedProducts = ref<any[]>([])
  const selectedCustomer = ref<CustomerDto | null>(null)
  const selectedPromotionId = ref<number | null>(null)

  // SEARCH
  const productSearch = ref('')
  const customerSearch = ref('')

  const showProductDropdown = ref(false)
  const showCustomerDropdown = ref(false)

  const productBox = ref<HTMLElement | null>(null)
  const customerBox = ref<HTMLElement | null>(null)

  onMounted(async () => {
    await Promise.all([
      productsStore.loadProducts(),
      customersStore.loadCustomers(),
      promotionsStore.loadPromotions(),
    ])

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

  // ----------------------
  // CUSTOMER
  // ----------------------

  const filteredCustomers = computed(() => {
    const term = customerSearch.value.toLowerCase().trim()
    if (!term) return customers.value

    return customers.value.filter(
      (c: any) =>
        (c.name ?? '').toLowerCase().includes(term) || (c.phone ?? '').toLowerCase().includes(term)
    )
  })

  const selectCustomer = (c: CustomerDto) => {
    selectedCustomer.value = c
    customerSearch.value = `${c.name} (${c.phone})`
    showCustomerDropdown.value = false
  }

  const clearCustomer = () => {
    selectedCustomer.value = null
    customerSearch.value = ''
  }

  // ----------------------
  // PRODUCTS
  // ----------------------

  const filteredProducts = computed(() => {
    const term = productSearch.value.toLowerCase().trim()
    if (!term) return products.value

    return products.value.filter(
      (p: any) =>
        (p.name ?? '').toLowerCase().includes(term) || (p.code ?? '').toLowerCase().includes(term)
    )
  })

  const selectProduct = (product: any) => {
    const exists = selectedProducts.value.find((p) => p.id === product.id)
    if (exists) return

    selectedProducts.value.push({
      ...product,
      purchase_qty: 1,
    })

    productSearch.value = ''
    showProductDropdown.value = false
  }

  const removeProduct = (index: number) => {
    selectedProducts.value.splice(index, 1)
  }

  const clearAllProducts = () => {
    selectedProducts.value = []
  }

  // ----------------------
  // PROMOTIONS
  // ----------------------

  const todayStr = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const availablePromotions = computed(() => {
    return promotions.value.filter((p: any) => {
      if (!p) return false
      if ((p.status ?? '').toUpperCase() !== 'ACTIVE') return false
      if (!p.startDate || !p.endDate) return false

      return p.startDate <= todayStr.value && p.endDate >= todayStr.value
    })
  })

  const selectedPromotion = computed(() => {
    if (selectedPromotionId.value == null) return null
    return (
      availablePromotions.value.find(
        (p: any) => Number(p.id) === Number(selectedPromotionId.value)
      ) ?? null
    )
  })

  // ----------------------
  // PRICING
  // ----------------------

  const getPromotionAdjustedPrice = (item: any) => {
    const basePrice = Number(item.finalPrice ?? 0)
    const promoPercent = Number(selectedPromotion.value?.discountRate ?? 0)

    if (promoPercent <= 0) return basePrice

    const discounted = basePrice - basePrice * (promoPercent / 100)
    return discounted < 0 ? 0 : discounted
  }

  const calculateItemTotal = (item: any) => {
    const qty = Number(item.purchase_qty ?? 1)
    const safeQty = qty > 0 ? qty : 1
    const price = getPromotionAdjustedPrice(item)
    return safeQty * price
  }
  const calculateOriginalItemTotal = (item: any) => {
    const qty = Number(item.purchase_qty ?? 1)
    const price = Number(item.finalPrice ?? 0)
    return qty * price
  }

  const subtotal = computed(() =>
    selectedProducts.value.reduce((sum, item) => sum + calculateOriginalItemTotal(item), 0)
  )
  const promotionSubtotal = computed(() =>
    selectedProducts.value.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  )

  const extraDiscountAmount = computed(() => {
    const sub = subtotal.value
    const percent = Number(discount.value ?? 0)
    if (percent <= 0) return 0
    return sub * (percent / 100)
  })

  const finalTotal = computed(() => {
    const sub = promotionSubtotal.value
    const percent = Number(discount.value ?? 0)

    const discountAmount = sub * (percent / 100)
    const total = sub - discountAmount

    return total < 0 ? 0 : total
  })
  const promotionDiscountAmount = computed(() => {
    return subtotal.value - promotionSubtotal.value
  })

  // ----------------------
  // VALIDATION
  // ----------------------

  const canCompletePurchase = computed(() => {
    if (submitting.value) return false
    if (!selectedCustomer.value) return false
    if (!selectedProducts.value.length) return false

    return selectedProducts.value.every((p) => Number(p.purchase_qty) > 0)
  })

  // ----------------------
  // SUBMIT
  // ----------------------

  const onCompletePurchase = async () => {
    if (!canCompletePurchase.value) return

    submitting.value = true
    submitError.value = null

    try {
      const payload: PurchaseSaveRequestDto = {
        customerId: Number(selectedCustomer.value!.id),
        status: 'CONFIRMED',
        promotionId: selectedPromotion.value ? Number(selectedPromotion.value.id) : null,
        discountAmount: null,
        discountPercentage: Number(discount.value ?? 0),
        items: selectedProducts.value.map((p) => ({
          productId: Number(p.id),
          qty: Number(p.purchase_qty ?? 1),
          sellingPrice: Number(getPromotionAdjustedPrice(p)),
        })),
      }

      await invoicesStore.createInvoice(payload)

      selectedProducts.value = []
      selectedCustomer.value = null
      selectedPromotionId.value = null
      customerSearch.value = ''
      productSearch.value = ''
      discount.value = 0

      router.push('/admin/purchase/list')
    } catch (e: any) {
      submitError.value = e?.message ?? 'Failed to complete purchase.'
    } finally {
      submitting.value = false
    }
  }

  const goToList = () => router.push('/admin/purchase/list')

  // ----------------------
  // HELPERS
  // ----------------------

  function formatMoney(v?: number | null) {
    const n = Number(v ?? 0)
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(n) + ' MMK'
    )
  }

  function formatPercent(v?: number | null) {
    const n = Number(v ?? 0)
    return `${n}%`
  }
</script>

<style scoped>
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
    vertical-align: middle;
  }

  .qty {
    width: 70px;
    padding: 4px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
  }

  .select-input {
    width: 180px;
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #fff;
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
    gap: 12px;
  }

  .dropdown-item:hover {
    background: #f1f5f9;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .summary-row.total {
    font-size: 18px;
    font-weight: 700;
    padding-top: 6px;
    border-top: 1px solid #e5e7eb;
  }

  .promotion-row {
    align-items: flex-start;
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

  @media (max-width: 1200px) {
    .purchase__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
