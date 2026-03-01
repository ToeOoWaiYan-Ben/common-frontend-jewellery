<template>
  <TablePage
    title="Purchase List"
    :total="totalItems"
    :filteredCount="filteredCount"
    :items="paginatedItems"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="false"
    :primaryButtonLabel="'Refresh'"
    idKey="id"
    :editingId="null"
    @click-new="onClickRefresh"
    @change-page="goToPage"
  >
    <!-- SEARCH -->
    <template #search>
      <div class="users-search">
        <span class="users-search__icon">🔍</span>
        <input
          v-model="searchTerm"
          class="users-search__input"
          type="text"
          placeholder="Search by invoice, customer, phone, date…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 80px">ID</th>
      <th style="width: 160px">Date</th>
      <th>Invoice</th>
      <th>Customer</th>
      <th style="width: 140px">Subtotal</th>
      <th style="width: 140px">Discount</th>
      <th style="width: 160px">Total</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ formatDate(item.createdAt) }}</td>
      <td>{{ item.invoiceNo ?? '-' }}</td>

      <td>
        <div style="display: flex; flex-direction: column; gap: 2px">
          <strong>{{ customerName(item.customerId) }}</strong>
          <span style="color: #64748b">{{ customerPhone(item.customerId) }}</span>
        </div>
      </td>

      <td>{{ formatMoney(item.subTotal) }}</td>
      <td>{{ formatMoney(item.discountAmount) }}</td>
      <td>
        <strong>{{ formatMoney(item.finalPrice) }}</strong>
      </td>

      <td>
        <div style="display: flex; gap: 0.25rem">
          <button class="btn-secondary" type="button" @click="onClickView(item)">View</button>

          <button
            class="btn-secondary btn-secondary--danger"
            type="button"
            @click="onClickDelete(item.id)"
          >
            Delete
          </button>
        </div>
      </td>
    </template>
  </TablePage>

  <!-- VIEW MODAL -->
  <div v-if="viewing" class="modalOverlay" @click.self="viewing = null">
    <div class="modalCard">
      <div class="modalHead">
        <h3 style="margin: 0">Purchase #{{ viewing.id }}</h3>
        <button class="btn-secondary" type="button" @click="viewing = null">Close</button>
      </div>

      <div class="modalMeta">
        <div><strong>Date:</strong> {{ formatDate(viewing.createdAt) }}</div>
        <div><strong>Invoice:</strong> {{ viewing.invoiceNo ?? '-' }}</div>
        <div>
          <strong>Customer:</strong>
          {{ customerName(viewing.customerId) }}
          <span v-if="customerPhone(viewing.customerId)">
            ({{ customerPhone(viewing.customerId) }})
          </span>
        </div>
        <div><strong>Subtotal:</strong> {{ formatMoney(viewing.subTotal) }}</div>
        <div><strong>Discount:</strong> {{ formatMoney(viewing.discountAmount) }}</div>
        <div><strong>Total:</strong> {{ formatMoney(viewing.finalPrice) }}</div>
      </div>

      <h4 style="margin: 12px 0 8px">Items</h4>
      <table class="miniTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Code</th>
            <th style="text-align: right">Qty</th>
            <th style="text-align: right">Unit</th>
            <th style="text-align: right">Total</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(it, idx) in viewing.items ?? []" :key="it.id ?? idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ productName(it.productId) }}</td>
            <td>{{ productCode(it.productId) }}</td>
            <td style="text-align: right">{{ it.qty }}</td>
            <td style="text-align: right">{{ formatMoney(it.sellingPrice) }}</td>
            <td style="text-align: right">{{ formatMoney(it.finalPrice) }}</td>
          </tr>

          <tr v-if="!viewing.items?.length">
            <td colspan="6" style="color: #64748b; padding: 10px">No items.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '@/components/TablePage.vue'

  import { useInvoicesStore } from '@/stores/useInvoicesStore'
  import { useCustomersStore } from '@/stores/useCustomersStore'
  import { useProductsStore } from '@/stores/useProductsStore'

  import type { InvoiceResponseDto } from '@/dtos/InvoiceDto'

  const invoicesStore = useInvoicesStore()
  const { items: invoices, loading, error } = storeToRefs(invoicesStore)

  const customersStore = useCustomersStore()
  const { items: customers } = storeToRefs(customersStore)

  const productsStore = useProductsStore()
  const { items: products } = storeToRefs(productsStore)

  const searchTerm = ref('')
  const viewing = ref<InvoiceResponseDto | null>(null)

  onMounted(async () => {
    if (!invoices.value.length) await invoicesStore.loadAll()
    if (!customers.value.length) await customersStore.loadCustomers()
    if (!products.value.length) await productsStore.loadProducts()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  // maps for quick lookup
  const customerMap = computed(() => {
    const m = new Map<number, any>()
    for (const c of customers.value) m.set(Number(c.id), c)
    return m
  })

  const productMap = computed(() => {
    const m = new Map<number, any>()
    for (const p of products.value) m.set(Number(p.id), p)
    return m
  })

  const customerName = (id: number) => customerMap.value.get(Number(id))?.name ?? '-'
  const customerPhone = (id: number) => customerMap.value.get(Number(id))?.phone ?? ''

  const productName = (id: number) => productMap.value.get(Number(id))?.name ?? String(id)
  const productCode = (id: number) => productMap.value.get(Number(id))?.code ?? '-'

  // filtering
  const filteredItems = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return invoices.value

    return invoices.value.filter((inv) => {
      const cName = customerName(inv.customerId).toLowerCase()
      const cPhone = customerPhone(inv.customerId).toLowerCase()

      return (
        String(inv.id).includes(term) ||
        (inv.invoiceNo ?? '').toLowerCase().includes(term) ||
        (inv.createdAt ?? '').toLowerCase().includes(term) ||
        cName.includes(term) ||
        cPhone.includes(term)
      )
    })
  })

  const totalItems = computed(() => invoices.value.length)
  const filteredCount = computed(() => filteredItems.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  const totalPages = computed(() =>
    filteredCount.value === 0 ? 1 : Math.max(1, Math.ceil(filteredCount.value / pageSize.value))
  )

  watch(filteredItems, () => {
    currentPage.value = 1
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  const onClickRefresh = async () => {
    await invoicesStore.loadAll()
  }

  const onClickView = (inv: InvoiceResponseDto) => {
    viewing.value = inv
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Delete this purchase?')
    if (!ok) return
    await invoicesStore.deleteOne(id)
  }

  function formatMoney(v?: number | null) {
    const n = Number(v ?? 0)
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(n) + ' MMK'
    )
  }

  function formatDate(iso?: string | null) {
    if (!iso) return '-'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString()
  }
</script>

<style scoped src="@/styles/admin/admin-table.css"></style>

<style scoped>
  .modalOverlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 2000;
  }
  .modalCard {
    width: min(900px, 100%);
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e5e7eb;
  }
  .modalHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .modalMeta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
    color: #0f172a;
    font-size: 14px;
  }
  .miniTable {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .miniTable th,
  .miniTable td {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px;
    text-align: left;
  }
</style>
