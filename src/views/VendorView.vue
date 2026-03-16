<template>
  <TablePage
    title="Sell Back / Vendors"
    :total="totalVendors"
    :filteredCount="filteredCount"
    :items="paginatedVendors"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Sell Back'"
    idKey="id"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <h3 class="vendor-form__title">New Sell Back</h3>

      <div v-if="formError" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ formError }}</span>
      </div>

      <!-- Invoice Search -->
      <div class="card">
        <h3 class="card__title">Invoice:</h3>

        <div class="search-row">
          <input
            v-model="invoiceSearch"
            class="input"
            placeholder="Search invoice number"
            @keyup.enter.prevent="handleSearchInvoice"
          />
          <button class="btn-secondary" type="button" @click="handleSearchInvoice">Search</button>
        </div>

        <div v-if="invoiceLoading" class="empty">Searching...</div>

        <div class="field">Invoice No: {{ selectedInvoice?.invoiceNo ?? '-' }}</div>
        <div class="field">Customer: {{ selectedInvoice?.customerName ?? '-' }}</div>
        <div class="field">Phone: {{ selectedInvoice?.customerPhone ?? '-' }}</div>

        <button
          v-if="selectedInvoice"
          class="clear-btn"
          type="button"
          @click="clearInvoice"
          style="width: auto; margin-top: 10px"
        >
          Clear Invoice
        </button>
      </div>

      <!-- Invoice Purchased Products -->
      <div
        v-if="
          selectedInvoice &&
          Array.isArray(selectedInvoice.items) &&
          selectedInvoice.items.length > 0
        "
        class="vendor-form__row"
      >
        <label class="vendor-form__label">Purchased Products</label>

        <div class="invoice-products">
          <div
            v-for="item in selectedInvoice.items"
            :key="item.purchaseItemId"
            class="invoice-product-row"
          >
            <div class="invoice-product-name">
              {{ item.productName }}
            </div>

            <button class="btn-mini" type="button" @click="addSellBackItem(item)">add</button>
          </div>
        </div>
      </div>

      <!-- Sell Back Item List -->
      <div v-if="sellBackItems.length" class="vendor-form__row">
        <label class="vendor-form__label">Sell Back Item List</label>

        <table class="simple-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Qty</th>
              <th>Selling Price</th>
              <th>Deduction Amount</th>
              <th>Final Buyback Price</th>
              <th style="width: 120px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sellBackItems" :key="item.purchaseItemId">
              <td>{{ item.productId }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ formatMoney(item.sellingPrice) }}</td>
              <td>
                <input
                  v-model.number="item.deductionAmount"
                  type="number"
                  min="0"
                  class="vendor-form__input"
                  @input="updateItemFinalPrice(item)"
                />
              </td>
              <td>{{ formatMoney(item.finalBuybackPrice) }}</td>
              <td>
                <button
                  class="btn-secondary btn-secondary--danger"
                  type="button"
                  @click="removeSellBackItem(item.purchaseItemId)"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Description -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Description *</label>
        <textarea v-model="formDesc" rows="3" class="vendor-form__input"></textarea>
      </div>

      <!-- Date -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Buyback Date</label>
        <input v-model="formBuybackDate" type="date" class="vendor-form__input" />
      </div>

      <!-- Total -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Total Buyback Price</label>
        <input :value="totalBuybackPrice" type="number" class="vendor-form__input" readonly />
      </div>

      <div class="vendor-form__actions">
        <button class="btn-secondary" type="button" @click="resetForm" :disabled="isSubmitting">
          Reset
        </button>

        <button
          class="btn-primary"
          type="button"
          @click="handleSubmitForm"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Saving…' : 'Save Sell Back' }}
        </button>
      </div>
    </template>

    <!-- SEARCH -->
    <template #search>
      <div class="users-search">
        <span class="users-search__icon">🔍</span>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search by desc, invoiceId, customerId…"
          class="users-search__input"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Invoice No</th>
      <th>Customer ID</th>
      <th>Total Buyback Price</th>
      <th>Buyback Date</th>
      <th>Description</th>
      <th style="width: 120px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.invoiceNo ?? item.invoiceId ?? '-' }}</td>
      <td>{{ item.customerId }}</td>
      <td>{{ formatMoney(item.totalBuybackPrice) }}</td>
      <td>{{ item.buybackDate ?? '-' }}</td>
      <td>{{ item.desc }}</td>
      <td>
        <button
          class="btn-secondary btn-secondary--danger"
          type="button"
          @click="onClickDelete(item.id)"
        >
          Delete
        </button>
      </td>
    </template>
  </TablePage>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'

  import { useVendorsStore } from '../stores/useVendorsStore'
  import type { VendorDto } from '../dtos/VendorDto'
  import type { VendorItemDto } from '../dtos/VendorItemDto'

  const vendorsStore = useVendorsStore()
  const { items: vendors, loading, error } = storeToRefs(vendorsStore)

  /* ---------------- Load ---------------- */
  onMounted(async () => {
    await vendorsStore.loadVendors()
  })
  const selectedInvoice = ref<any | null>(null)
  const invoiceLoading = ref(false)
  const selectInvoice = (inv: any) => {
    selectedInvoice.value = inv
    invoiceSearch.value = inv.invoiceNo
    formInvoiceId.value = Number(inv.invoiceId)
    formCustomerId.value = Number(inv.customerId)
    formError.value = null
  }

  const clearInvoice = () => {
    invoiceSearch.value = ''
    invoiceLookup.value = null
    selectedInvoice.value = null
    formInvoiceId.value = null
    formCustomerId.value = null
    sellBackItems.value = []
    formError.value = null
  }

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  /* ---------------- Invoice Search + Sell Back Form ---------------- */
  const invoiceSearch = ref('')
  const invoiceLookup = ref<any | null>(null)
  const sellBackItems = ref<VendorItemDto[]>([])

  const formInvoiceId = ref<number | null>(null)
  const formCustomerId = ref<number | null>(null)
  const formDesc = ref('')
  const formBuybackDate = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const totalBuybackPrice = computed(() => {
    return sellBackItems.value.reduce((sum, item) => {
      return sum + Number(item.finalBuybackPrice ?? 0)
    }, 0)
  })
  const handleSearchInvoice = async () => {
    formError.value = null
    invoiceLookup.value = null
    selectedInvoice.value = null
    sellBackItems.value = []
    formInvoiceId.value = null
    formCustomerId.value = null

    const invoiceNo = invoiceSearch.value.trim()

    if (!invoiceNo) {
      formError.value = 'Invoice number is required.'
      return
    }

    invoiceLoading.value = true
    try {
      const raw = await vendorsStore.searchInvoice(invoiceNo)
      const result = (raw as any)?.data ?? raw

      if (!result || !result.invoiceId) {
        formError.value = 'Invoice not found.'
        return
      }

      invoiceLookup.value = result
      selectedInvoice.value = result
      formInvoiceId.value = Number(result.invoiceId)
      formCustomerId.value = Number(result.customerId)
    } catch (e: any) {
      formError.value = e?.message ?? 'Invoice not found.'
    } finally {
      invoiceLoading.value = false
    }
  }

  const addSellBackItem = (item: any) => {
    const exists = sellBackItems.value.find((x) => x.purchaseItemId === item.purchaseItemId)
    if (exists) return

    sellBackItems.value.push({
      purchaseItemId: Number(item.purchaseItemId),
      productId: Number(item.productId),
      qty: Number(item.qty),
      sellingPrice: Number(item.sellingPrice ?? 0),
      deductionAmount: 0,
      finalBuybackPrice: Number(item.sellingPrice ?? 0),
    })
  }

  const removeSellBackItem = (purchaseItemId: number) => {
    sellBackItems.value = sellBackItems.value.filter((x) => x.purchaseItemId !== purchaseItemId)
  }

  const updateItemFinalPrice = (item: VendorItemDto) => {
    const selling = Number(item.sellingPrice ?? 0)
    const deduction = Number(item.deductionAmount ?? 0)
    const finalPrice = selling - deduction
    item.finalBuybackPrice = finalPrice < 0 ? 0 : finalPrice
  }

  /* ---------------- List Search ---------------- */
  const searchTerm = ref('')

  const filteredVendors = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return vendors.value

    return vendors.value.filter((v: any) => {
      return (
        String(v.desc ?? '')
          .toLowerCase()
          .includes(term) ||
        String(v.invoiceId ?? '').includes(term) ||
        String(v.customerId ?? '').includes(term)
      )
    })
  })

  const totalVendors = computed(() => vendors.value.length)
  const filteredCount = computed(() => filteredVendors.value.length)

  /* ---------------- Pagination ---------------- */
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredVendors, () => {
    currentPage.value = 1
  })

  const paginatedVendors = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredVendors.value.slice(start, end)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  /* ---------------- Form Show/Hide ---------------- */
  const showForm = ref(false)

  const resetForm = () => {
    invoiceSearch.value = ''
    invoiceLookup.value = null
    selectedInvoice.value = null
    sellBackItems.value = []
    formInvoiceId.value = null
    formCustomerId.value = null
    formDesc.value = ''
    formBuybackDate.value = ''
    formError.value = null
  }
  const getProductName = (productId: number) => {
    const found = selectedInvoice.value?.items?.find(
      (x: any) => Number(x.productId) === Number(productId)
    )
    return found?.productName ?? `Product ${productId}`
  }

  const onClickNew = () => {
    resetForm()
    showForm.value = !showForm.value
  }

  /* ---------------- Save ---------------- */
  const handleSubmitForm = async () => {
    formError.value = null

    if (!formInvoiceId.value) {
      formError.value = 'Please search and select an invoice first.'
      return
    }

    if (!formCustomerId.value) {
      formError.value = 'Customer is required.'
      return
    }

    if (!formDesc.value.trim()) {
      formError.value = 'Description is required.'
      return
    }

    if (sellBackItems.value.length === 0) {
      formError.value = 'Please add at least one sell-back item.'
      return
    }

    const payload: Omit<VendorDto, 'id'> = {
      invoiceId: Number(formInvoiceId.value),
      customerId: Number(formCustomerId.value),
      desc: formDesc.value.trim(),
      buybackDate: formBuybackDate.value || null,
      totalBuybackPrice: Number(totalBuybackPrice.value ?? 0),
      items: sellBackItems.value.map((item) => ({
        purchaseItemId: Number(item.purchaseItemId),
        productId: Number(item.productId),
        qty: Number(item.qty),
        sellingPrice: Number(item.sellingPrice),
        deductionAmount: Number(item.deductionAmount ?? 0),
        finalBuybackPrice: Number(item.finalBuybackPrice),
      })),
    }

    isSubmitting.value = true
    try {
      await vendorsStore.createVendor(payload)
      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving sell back.'
    } finally {
      isSubmitting.value = false
    }
  }

  /* ---------------- Delete ---------------- */
  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this sell back record?')
    if (!ok) return

    try {
      await vendorsStore.deleteVendor(id)
    } catch (e: any) {
      alert(e?.message ?? 'Something went wrong while deleting.')
    }
  }

  /* ---------------- Helpers ---------------- */
  function formatMoney(v?: number | null) {
    const n = Number(v ?? 0)
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' MMK'
  }
</script>

<style scoped>
  .vendor-form__title {
    font-weight: 900;
    margin-bottom: 12px;
  }

  .vendor-form__row {
    display: grid;
    gap: 6px;
    margin-bottom: 12px;
  }

  .vendor-form__label {
    font-size: 13px;
    font-weight: 900;
    color: #374151;
  }

  .vendor-form__input {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
    width: 100%;
  }

  .vendor-form__actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }

  .tinyHint {
    font-size: 12px;
    font-weight: 800;
    color: #475569;
  }

  .search-row {
    display: flex;
    gap: 8px;
  }

  .simple-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  .simple-table th,
  .simple-table td {
    border: 1px solid #d1d5db;
    padding: 8px;
    text-align: left;
  }

  .simple-table th {
    background: #f8fafc;
    font-weight: 800;
  }
  .card {
    border: 1px solid #d1d5db;
    border-radius: 14px;
    padding: 16px;
    background: #fff;
    display: grid;
    gap: 10px;
  }

  .card__title {
    font-size: 18px;
    font-weight: 900;
    margin: 0;
  }

  .search-wrapper {
    position: relative;
  }

  .input {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
    width: 100%;
  }

  .dropdown {
    position: absolute;
    width: 100%;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    max-height: 220px;
    overflow-y: auto;
    z-index: 2000;
    margin-top: 4px;
  }

  .dropdown-item {
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
  }

  .dropdown-item:hover {
    background: #f1f5f9;
  }

  .empty {
    padding: 10px;
    color: #6b7280;
  }

  .field {
    font-size: 14px;
    color: #374151;
  }

  .clear-btn {
    padding: 8px 14px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 8px;
    cursor: pointer;
  }
</style>
