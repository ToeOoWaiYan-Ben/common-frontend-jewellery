<template>
  <TablePage
    title="Vendors"
    :total="totalVendors"
    :filteredCount="filteredCount"
    :items="paginatedVendors"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="
      showForm && !isEditing ? 'Close Form' : isEditing ? 'Editing...' : 'Create New Vendor'
    "
    idKey="id"
    @click-new="onClickNew"
    @change-page="goToPage"
    :editingId="editingId"
  >
    <!-- FORM -->
    <template #form>
      <h3 class="vendor-form__title">
        {{ isEditing ? 'Edit Vendor' : 'New Vendor' }}
      </h3>

      <div v-if="formError" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ formError }}</span>
      </div>

      <!-- ✅ CUSTOMER SEARCH (NO INPUT customerId) -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Customer *</label>

        <div class="search-wrapper" ref="customerBox">
          <input
            v-model="customerSearch"
            @focus="showCustomerDropdown = true"
            class="vendor-form__input"
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

        <!-- read-only preview -->
        <div class="tinyHint" v-if="selectedCustomer">
          Selected: <strong>{{ selectedCustomer.name }}</strong> ({{ selectedCustomer.phone }})
        </div>
      </div>

      <!-- fields -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Description *</label>
        <textarea v-model="formDesc" rows="3" class="vendor-form__input"></textarea>
      </div>

      <!-- ✅ Purity -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Purity *</label>
        <select v-model="selectedPurity" class="vendor-form__input" required>
          <option value="K24">24K</option>
          <option value="K22">22K</option>
          <option value="K18">18K</option>
          <option value="K14">14K</option>
        </select>

        <div class="tinyHint" v-if="activeGoldPrice">
          Active Sell Price: <strong>{{ formatMoney(activeGoldPrice.sellPrice) }}</strong> ({{
            activeGoldPrice.recordDate
          }})
        </div>

        <div class="tinyHint" v-else>No ACTIVE gold price found for {{ selectedPurity }}.</div>
      </div>

      <!-- ✅ Gold Price (ACTIVE only, by purity) -->
      <div class="vendor-form__row">
        <label class="vendor-form__label">Gold Price (ACTIVE) *</label>

        <select
          v-model.number="formGoldPriceId"
          class="vendor-form__input"
          :disabled="!activeGoldPrice"
          required
        >
          <option :value="undefined" disabled>Select active gold price…</option>

          <!-- We only show the active record -->
          <option v-if="activeGoldPrice" :value="activeGoldPrice.id">
            {{ activeGoldPrice.purity }} | Sell: {{ formatMoney(activeGoldPrice.sellPrice) }} |
            Date: {{ activeGoldPrice.recordDate }}
          </option>
        </select>
      </div>
      <div class="vendor-form__row">
        <label class="vendor-form__label">Buyback Base Price</label>
        <input
          v-model.number="formBuybackBasePrice"
          type="number"
          min="0"
          class="vendor-form__input"
        />
      </div>

      <div class="vendor-form__row">
        <label class="vendor-form__label">Deduction Rate</label>
        <input
          v-model.number="formDeductionRate"
          type="number"
          min="0"
          step="0.01"
          class="vendor-form__input"
        />
      </div>

      <div class="vendor-form__row">
        <label class="vendor-form__label">Deduction Amount</label>
        <input :value="deductionAmount" type="number" class="vendor-form__input" readonly />
      </div>

      <div class="vendor-form__row">
        <label class="vendor-form__label">Buyback Price</label>
        <input :value="buybackPrice" type="number" class="vendor-form__input" readonly />
      </div>

      <div class="vendor-form__row">
        <label class="vendor-form__label">Buyback Date</label>
        <input v-model="formBuybackDate" type="date" class="vendor-form__input" />
      </div>

      <div class="vendor-form__actions">
        <button class="btn-secondary" type="button" @click="resetForm" :disabled="isSubmitting">
          Reset
        </button>

        <button
          v-if="isEditing"
          class="btn-secondary"
          type="button"
          @click="closeEdit"
          :disabled="isSubmitting"
        >
          Close
        </button>

        <button
          class="btn-primary"
          type="button"
          @click="handleSubmitForm"
          :disabled="isSubmitting"
        >
          {{
            isSubmitting
              ? isEditing
                ? 'Updating…'
                : 'Saving…'
              : isEditing
                ? 'Update Vendor'
                : 'Save Vendor'
          }}
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
          placeholder="Search by desc or customerId…"
          class="users-search__input"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Customer ID</th>
      <th>Gold Price ID</th>
      <th>Buyback Price</th>
      <th>Buyback Date</th>
      <th>Description</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.customerId }}</td>
      <td>{{ item.goldPriceId }}</td>
      <td>{{ formatMoney(item.buybackPrice) }}</td>
      <td>{{ item.buybackDate ?? '-' }}</td>
      <td>{{ item.desc }}</td>
      <td>
        <div style="display: flex; gap: 0.25rem">
          <button class="btn-secondary" type="button" @click="onClickEdit(item)">Edit</button>
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
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'

  import { useVendorsStore } from '../stores/useVendorsStore'
  import { useCustomersStore } from '../stores/useCustomersStore'
  import type { VendorDto } from '../dtos/VendorDto'
  import type { CustomerDto } from '../dtos/CustomerDto'
  import { useGoldPriceHistoryStore } from '../stores/useGoldPriceHistoryStore'
  import type { GoldPurity, GoldPriceHistoryDto } from '../dtos/GoldPriceHistoryDto'
  const goldPriceStore = useGoldPriceHistoryStore()
  const { items: goldPrices } = storeToRefs(goldPriceStore)

  const vendorsStore = useVendorsStore()
  const { items: vendors, loading, error } = storeToRefs(vendorsStore)

  const customersStore = useCustomersStore()
  const { items: customers } = storeToRefs(customersStore)

  onMounted(async () => {
    await vendorsStore.loadVendors()
    if (!customers.value.length) await customersStore.loadCustomers()
    if (!goldPrices.value.length) await goldPriceStore.loadAll()
    document.addEventListener('click', handleClickOutside)
  })
  const selectedPurity = ref<GoldPurity>('K24')

  // active record for selected purity
  const activeGoldPrice = computed<GoldPriceHistoryDto | null>(() => {
    const p = selectedPurity.value
    const found = goldPrices.value.find((x) => x.purity === p && x.status === 'ACTIVE')
    return found ?? null
  })

  // whenever purity changes, auto-set goldPriceId to the active one
  watch(selectedPurity, () => {
    formGoldPriceId.value = activeGoldPrice.value?.id ?? null
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  /* ---------- customer dropdown (copied from Purchase) ---------- */
  const customerSearch = ref('')
  const showCustomerDropdown = ref(false)
  const selectedCustomer = ref<CustomerDto | null>(null)
  const customerBox = ref<HTMLElement | null>(null)

  const handleClickOutside = (event: MouseEvent) => {
    const t = event.target as Node
    if (customerBox.value && !customerBox.value.contains(t)) showCustomerDropdown.value = false
  }

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
    customerSearch.value = `${c.name} (${(c as any).phone ?? ''})`
    showCustomerDropdown.value = false

    // ✅ this is the key: store customerId into vendor form
    formCustomerId.value = Number(c.id)
  }

  /* ---------- list search ---------- */
  const searchTerm = ref('')
  const filteredVendors = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return vendors.value
    return vendors.value.filter((v: any) => {
      return (
        String(v.desc ?? '')
          .toLowerCase()
          .includes(term) || String(v.customerId ?? '').includes(term)
      )
    })
  })

  const totalVendors = computed(() => vendors.value.length)
  const filteredCount = computed(() => filteredVendors.value.length)

  /* ---------- pagination ---------- */
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

  /* ---------- form state ---------- */
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formCustomerId = ref<number | null>(null)
  const formGoldPriceId = ref<number | null>(null)
  const formDesc = ref('')
  const formBuybackBasePrice = ref(0)
  const formDeductionRate = ref(0)
  const deductionAmount = computed(() => {
    const base = Number(formBuybackBasePrice.value ?? 0)
    const rate = Number(formDeductionRate.value ?? 0)
    if (base <= 0 || rate <= 0) return 0
    return (base * rate) / 100
  })

  const buybackPrice = computed(() => {
    const base = Number(formBuybackBasePrice.value ?? 0)
    const ded = Number(deductionAmount.value ?? 0)
    const result = base - ded
    return result < 0 ? 0 : result
  })
  const formBuybackDate = ref('')

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const resetForm = () => {
    formCustomerId.value = null
    formGoldPriceId.value = null
    formDesc.value = ''
    formBuybackBasePrice.value = 0
    formDeductionRate.value = 0
    formBuybackDate.value = ''

    // reset customer selector UI too
    selectedCustomer.value = null
    customerSearch.value = ''
    showCustomerDropdown.value = false

    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const onClickNew = () => {
    resetForm()
    isEditing.value = false
    showForm.value = !showForm.value
  }

  const onClickEdit = (v: VendorDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = v.id

    formCustomerId.value = Number(v.customerId)
    formGoldPriceId.value = Number(v.goldPriceId)
    formDesc.value = v.desc ?? ''
    formBuybackBasePrice.value = Number(v.buybackBasePrice ?? 0)
    formDeductionRate.value = Number(v.deductionRate ?? 0)
    formBuybackBasePrice.value = Number(v.buybackBasePrice ?? 0)
    formDeductionRate.value = Number(v.deductionRate ?? 0)
    formBuybackDate.value = v.buybackDate ?? ''

    // optional: show customerId in input as text if you want
    selectedCustomer.value = null
    customerSearch.value = `Customer ID: ${v.customerId}`
    formError.value = null

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formCustomerId.value) {
      formError.value = 'Customer is required. Please search and select a customer.'
      return
    }
    if (!formGoldPriceId.value) {
      formError.value = 'Gold Price ID is required.'
      return
    }
    if (!formDesc.value.trim()) {
      formError.value = 'Description is required.'
      return
    }

    const payload = {
      customerId: Number(formCustomerId.value),
      goldPriceId: Number(formGoldPriceId.value),
      desc: formDesc.value.trim(),
      buybackBasePrice: Number(formBuybackBasePrice.value ?? 0),
      deductionRate: Number(formDeductionRate.value ?? 0),
      deductionAmount: Number(deductionAmount.value ?? 0),
      buybackPrice: Number(buybackPrice.value ?? 0),
      buybackDate: formBuybackDate.value || null,
    } as any

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await vendorsStore.updateVendor(editingId.value, payload)
      } else {
        await vendorsStore.createVendor(payload)
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Something went wrong while saving vendor.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this vendor record?')
    if (!ok) return

    try {
      await vendorsStore.deleteVendor(id)

      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Something went wrong while deleting vendor.')
    }
  }

  // helpers
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

  .search-wrapper {
    position: relative;
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

  /* assumes your TablePage already has btn classes */
</style>
