<template>
    <div class="page" @click="closeAllDropdowns">
      <!-- Header -->
      <div class="head">
        <div>
          <h2 class="head__title">Create Order</h2>
          <p class="head__sub">Select customer, then add items (PRODUCT or CUSTOM).</p>
        </div>
  
        <div class="head__actions">
          <button class="btn btnGhost" type="button" @click="addItem">+ Add Item</button>
          <button class="btn btnPrimary" type="button" @click="save" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save Order' }}
          </button>
        </div>
      </div>
  
      <!-- Error -->
      <div v-if="formError" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ formError }}</span>
      </div>
  
      <!-- Customer Card -->
      <div class="card" @click.stop>
        <div class="card__title">Customer</div>
  
        <div class="row2">
          <div class="field">
            <label class="label">Search Customer *</label>
  
            <div class="searchWrap" ref="customerBox">
              <input
                v-model="customerSearch"
                class="input"
                placeholder="Search by name or phone..."
                @focus="customerDdOpen = true"
              />
  
              <div v-if="customerDdOpen" class="dd">
                <button
                  v-for="c in filteredCustomers"
                  :key="c.id"
                  type="button"
                  class="dd__item"
                  @click="selectCustomer(c)"
                >
                  <div class="dd__main">{{ c.name }}</div>
                  <div class="dd__sub">{{ c.phone }}</div>
                </button>
  
                <div v-if="filteredCustomers.length === 0" class="dd__empty">No customers found.</div>
              </div>
            </div>
  
            <div v-if="selectedCustomer" class="tinyHint">
              Selected: <b>{{ selectedCustomer.name }}</b> ({{ selectedCustomer.phone }})
            </div>
          </div>
  
          <div class="field">
            <label class="label">Order Summary</label>
            <div class="pillBox">
              <div class="pillLine">
                <span class="pillLabel">Items</span>
                <span class="pillValue">{{ items.length }}</span>
              </div>
              <div class="pillLine">
                <span class="pillLabel">Custom Total</span>
                <span class="pillValue">{{ customTotal.toLocaleString() }} MMK</span>
              </div>
              <div class="pillLine">
                <span class="pillLabel">Note</span>
                <span class="pillMuted">Product pricing can be added later</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Items Table -->
      <div class="card">
        <div class="cardTop">
          <div>
            <div class="card__title">Order Items</div>
            <div class="tinyHint">Tip: CUSTOM rows require note + unit price.</div>
          </div>
  
          <button class="btn btnGhost" type="button" @click="addItem">+ Add Item</button>
        </div>
  
        <div class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th class="colNo">#</th>
                <th class="colType">Type</th>
                <th class="colInfo">Item Info</th>
                <th class="colQty">Qty</th>
                <th class="colUnit">Unit Price</th>
                <th class="colTotal">Line Total</th>
                <th class="colAct">Actions</th>
              </tr>
            </thead>
  
            <tbody>
              <tr v-for="(it, idx) in items" :key="it.key" @click.stop>
                <!-- # -->
                <td class="tdNo">{{ idx + 1 }}</td>
  
                <!-- Type -->
                <td>
                  <select v-model="it.type" class="select" @change="onTypeChange(it)">
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </td>
  
                <!-- Item info -->
                <td>
                  <!-- PRODUCT -->
                  <div v-if="it.type === 'PRODUCT'" class="infoBlock">
                    <label class="miniLabel">Product *</label>
  
                    <div class="searchWrap" :ref="setProductBoxRef(it.key)">
                      <input
                        v-model="it.productSearch"
                        class="input"
                        placeholder="Search product by name/code/id..."
                        @focus="openProductDd(it.key)"
                      />
  
                      <div v-if="it.productDdOpen" class="dd">
                        <button
                          v-for="p in filteredProducts(it.productSearch)"
                          :key="p.id"
                          type="button"
                          class="dd__item"
                          @click="selectProduct(it, p)"
                        >
                          <div class="dd__main">
                            {{ p.name }}
                            <span class="dd__tag">ID: {{ p.id }}</span>
                          </div>
                          <div class="dd__sub">
                            Code: {{ p.code ?? '-' }} • Stock: {{ Number(p.qty ?? 0) }}
                          </div>
                        </button>
  
                        <div v-if="filteredProducts(it.productSearch).length === 0" class="dd__empty">
                          No products found.
                        </div>
                      </div>
                    </div>
  
                    <div v-if="it.productId" class="tinyHint">
                      Selected: <b>{{ it.productName }}</b> • Stock:
                      <b>{{ selectedStock(it.productId) }}</b>
                      <span v-if="isOutOfStock(it)" class="warnBad"> • Out of stock</span>
                    </div>
  
                    <div v-if="!it.productId" class="tinyErr">Please select a product.</div>
                  </div>
  
                  <!-- CUSTOM -->
                  <div v-else class="infoBlock">
                    <div class="grid2">
                      <div>
                        <label class="miniLabel">Custom Note *</label>
                        <input
                          v-model.trim="it.customNote"
                          class="input"
                          placeholder="e.g. ring size 18 / engraving / gem color..."
                        />
                        <div v-if="!String(it.customNote || '').trim()" class="tinyErr">
                          Custom note is required.
                        </div>
                      </div>
  
                      <div>
                        <label class="miniLabel">Custom Item Name</label>
                        <input v-model.trim="it.customName" class="input" placeholder="e.g. Custom Ring" />
                      </div>
                    </div>
  
                    <div class="grid2" style="margin-top: 8px;">
                      <div>
                        <label class="miniLabel">Priority</label>
                        <select v-model="it.priority" class="select">
                          <option value="NORMAL">NORMAL</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </div>
  
                      <div class="tinyHint" style="align-self:end;">
                        Next later: show goldRows + jewelleryRows inputs here (CUSTOM only).
                      </div>
                    </div>
                  </div>
                </td>
  
                <!-- Qty -->
                <td>
                  <input v-model.number="it.qty" type="number" min="1" class="input inputTight" />
                  <div v-if="Number(it.qty) <= 0" class="tinyErr">Qty must be ≥ 1</div>
                </td>
  
                <!-- Unit price -->
                <td>
                  <input
                    v-model.number="it.unitPrice"
                    type="number"
                    min="0"
                    class="input inputTight"
                    :disabled="it.type === 'PRODUCT'"
                    :placeholder="it.type === 'PRODUCT' ? 'Auto later' : 'e.g. 350000'"
                  />
                  <div v-if="it.type === 'CUSTOM' && Number(it.unitPrice) <= 0" class="tinyErr">
                    Unit price required
                  </div>
                </td>
  
                <!-- line total -->
                <td>
                  <div class="readPill">{{ lineTotal(it).toLocaleString() }} MMK</div>
                  <div class="tinyHint">CUSTOM: unitPrice × qty</div>
                </td>
  
                <!-- actions -->
                <td>
                  <div class="actRow">
                    <button class="btnMini" type="button" @click="duplicateItem(it)">Duplicate</button>
                    <button class="btnMini btnMiniDanger" type="button" @click="removeItem(it.key)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
  
              <tr v-if="items.length === 0">
                <td colspan="7" class="emptyRow">No items. Click “+ Add Item”.</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div class="footActions">
          <button class="btn btnGhost" type="button" @click="addItem">+ Add Item</button>
          <button class="btn btnPrimary" type="button" @click="save" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save Order' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useCustomersStore } from '../stores/useCustomersStore'
  import { useProductsStore } from '../stores/useProductsStore'
  import { useOrdersStore } from '../stores/useOrdersStore'
  
  type CustomerDto = { id: number; name: string; phone: string }
  type ProductDto = { id: number; name: string; code?: string; qty?: number }
  
  type OrderItemUi = {
    key: string
    type: 'PRODUCT' | 'CUSTOM'
  
    qty: number
    unitPrice: number
  
    // product
    productId: number | null
    productName: string
    productSearch: string
    productDdOpen: boolean
  
    // custom
    customNote: string
    customName: string
    priority: 'NORMAL' | 'URGENT'
  }
  
  const customersStore = useCustomersStore()
  const productsStore = useProductsStore()
  const ordersStore = useOrdersStore()
  
  const { items: customers } = storeToRefs(customersStore)
  const { items: products } = storeToRefs(productsStore)
  
  const saving = ref(false)
  const formError = ref<string | null>(null)
  
  /* -------- Order state -------- */
  const order = reactive({
    customerId: null as number | null,
  })
  
  const selectedCustomer = ref<CustomerDto | null>(null)
  
  /* -------- Customer dropdown (Vendor style) -------- */
  const customerBox = ref<HTMLElement | null>(null)
  const customerSearch = ref('')
  const customerDdOpen = ref(false)
  
  const filteredCustomers = computed(() => {
    const term = customerSearch.value.trim().toLowerCase()
    const list = (customers.value ?? []) as any[]
    if (!term) return list.slice(0, 30)
    return list
      .filter((c: any) => {
        return (
          String(c.name ?? '').toLowerCase().includes(term) ||
          String(c.phone ?? '').toLowerCase().includes(term) ||
          String(c.id ?? '').includes(term)
        )
      })
      .slice(0, 30)
  })
  
  function selectCustomer(c: any) {
    selectedCustomer.value = c
    order.customerId = Number(c.id)
    customerSearch.value = `${c.name} (${c.phone})`
    customerDdOpen.value = false
  }
  
  /* -------- Items -------- */
  const items = reactive<OrderItemUi[]>([])
  
  function newItem(): OrderItemUi {
    return {
      key: crypto.randomUUID(),
      type: 'PRODUCT',
      qty: 1,
      unitPrice: 0,
  
      productId: null,
      productName: '',
      productSearch: '',
      productDdOpen: false,
  
      customNote: '',
      customName: '',
      priority: 'NORMAL',
    }
  }
  
  function addItem() {
    items.push(newItem())
  }
  
  function removeItem(key: string) {
    if (items.length <= 1) return
    const idx = items.findIndex((x) => x.key === key)
    if (idx !== -1) items.splice(idx, 1)
  }
  
  function duplicateItem(src: OrderItemUi) {
    const copy: OrderItemUi = {
      ...structuredClone(src),
      key: crypto.randomUUID(),
      productDdOpen: false,
    }
    items.push(copy)
  }
  
  function onTypeChange(it: OrderItemUi) {
    formError.value = null
  
    if (it.type === 'PRODUCT') {
      // clear custom fields
      it.customNote = ''
      it.customName = ''
      it.priority = 'NORMAL'
      it.unitPrice = 0
    } else {
      // clear product fields
      it.productId = null
      it.productName = ''
      it.productSearch = ''
      it.productDdOpen = false
    }
  }
  
  /* -------- Product dropdown per row -------- */
  const productBoxRefs = new Map<string, HTMLElement>()
  
  const setProductBoxRef = (key: string) => (el: any) => {
    if (el) productBoxRefs.set(key, el as HTMLElement)
  }
  
  function openProductDd(key: string) {
    items.forEach((x) => (x.productDdOpen = x.key === key))
  }
  
  function filteredProducts(q: string): ProductDto[] {
    const term = (q || '').trim().toLowerCase()
    const list = (products.value ?? []) as any[]
    if (!term) return list.slice(0, 30)
    return list
      .filter((p: any) => {
        return (
          String(p.name ?? '').toLowerCase().includes(term) ||
          String(p.code ?? '').toLowerCase().includes(term) ||
          String(p.id ?? '').includes(term)
        )
      })
      .slice(0, 30)
  }
  
  function selectProduct(it: OrderItemUi, p: any) {
    it.productId = Number(p.id)
    it.productName = String(p.name ?? '')
    it.productSearch = `${p.name} • Stock: ${Number(p.qty ?? 0)}`
    it.productDdOpen = false
  }
  
  function selectedStock(productId: number) {
    const p: any = (products.value ?? []).find((x: any) => Number(x.id) === Number(productId))
    return Number(p?.qty ?? 0)
  }
  
  function isOutOfStock(it: OrderItemUi) {
    if (!it.productId) return false
    const stock = selectedStock(it.productId)
    const q = Number(it.qty ?? 0)
    return q <= 0 || stock < q
  }
  
  function lineTotal(it: OrderItemUi) {
    const qty = Math.max(0, Number(it.qty ?? 0))
    if (it.type === 'CUSTOM') {
      const unit = Math.max(0, Number(it.unitPrice ?? 0))
      return Math.round(unit * qty)
    }
    return 0
  }
  
  const customTotal = computed(() => items.reduce((sum, it) => sum + lineTotal(it), 0))
  
  /* -------- Close dropdowns on outside click -------- */
  function closeAllDropdowns() {
    customerDdOpen.value = false
    items.forEach((x) => (x.productDdOpen = false))
  }
  
  function handleDocClick(e: MouseEvent) {
    const t = e.target as Node
  
    // customer
    if (customerBox.value && !customerBox.value.contains(t)) customerDdOpen.value = false
  
    // products (per row)
    for (const r of items) {
      const box = productBoxRefs.get(r.key)
      if (box && !box.contains(t)) r.productDdOpen = false
    }
  }
  
  /* -------- Save -------- */
  function validate(): string | null {
    if (!order.customerId) return 'Customer is required. Please select a customer.'
    if (!items.length) return 'At least 1 order item is required.'
  
    for (const it of items) {
      if (Number(it.qty ?? 0) <= 0) return 'Qty must be at least 1.'
  
      if (it.type === 'PRODUCT') {
        if (!it.productId) return 'Please select a product for all PRODUCT items.'
        // optional: block out-of-stock
        // if (isOutOfStock(it)) return 'One PRODUCT item is out of stock.'
      } else {
        if (!String(it.customNote || '').trim()) return 'Custom note is required for CUSTOM items.'
        if (Number(it.unitPrice ?? 0) <= 0) return 'Unit price is required for CUSTOM items.'
      }
    }
    return null
  }
  
  async function save() {
    formError.value = null
    const err = validate()
    if (err) {
      formError.value = err
      return
    }
  
    const payload = {
      customerId: Number(order.customerId),
      items: items.map((it) => ({
        type: it.type,
        qty: Number(it.qty),
        productId: it.type === 'PRODUCT' ? Number(it.productId) : null,
        productName: it.type === 'PRODUCT' ? it.productName : null,
        customNote: it.type === 'CUSTOM' ? it.customNote : null,
        unitPrice: it.type === 'CUSTOM' ? Number(it.unitPrice) : null,
        // later (custom materials):
        // goldRows: [],
        // jewelleryRows: [],
      })),
    }
  
    saving.value = true
    try {
      await ordersStore.createOrder(payload as any, true)
  
      // reset
      order.customerId = null
      selectedCustomer.value = null
      customerSearch.value = ''
      items.splice(0, items.length)
      addItem()
  
      alert('Order created!')
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to create order.'
    } finally {
      saving.value = false
    }
  }
  
  /* -------- lifecycle -------- */
  onMounted(async () => {
    if (!customers.value?.length) await customersStore.loadCustomers()
    if (!products.value?.length) await productsStore.loadProducts()
    if (items.length === 0) addItem()
    document.addEventListener('click', handleDocClick)
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocClick)
  })
  </script>
  
  <style scoped>
  .page {
    padding: 18px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* header */
  .head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .head__title {
    font-size: 22px;
    margin: 0;
  }
  .head__sub {
    margin: 6px 0 0;
    opacity: 0.75;
  }
  .head__actions {
    display: flex;
    gap: 8px;
  }
  
  /* cards */
  .card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 14px;
  }
  .cardTop {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .card__title {
    font-weight: 800;
    margin-bottom: 10px;
  }
  
  /* form */
  .row2 {
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
    gap: 12px;
  }
  .field { min-width: 0; }
  .label {
    display: block;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .miniLabel {
    display: block;
    font-size: 12px;
    font-weight: 800;
    opacity: 0.75;
    margin-bottom: 6px;
  }
  
  .input, .select {
    width: 100%;
    border: 1px solid #d8dbe0;
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    box-sizing: border-box;
  }
  .inputTight {
    padding: 9px 10px;
    border-radius: 12px;
  }
  
  .tinyHint {
    margin-top: 6px;
    font-size: 12px;
    opacity: 0.8;
  }
  .tinyErr {
    margin-top: 6px;
    font-size: 12px;
    color: #b00020;
    font-weight: 700;
  }
  .warnBad {
    color: #b00020;
    font-weight: 900;
  }
  
  /* pill summary */
  .pillBox {
    border: 1px dashed #e6e6e6;
    border-radius: 14px;
    padding: 12px;
    background: #fafafa;
  }
  .pillLine {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 6px 0;
  }
  .pillLabel { font-weight: 800; opacity: 0.8; }
  .pillValue { font-weight: 900; }
  .pillMuted { opacity: 0.7; }
  
  /* dropdown */
  .searchWrap { position: relative; }
  .dd {
    position: absolute;
    z-index: 30;
    width: 100%;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 14px;
    margin-top: 6px;
    max-height: 260px;
    overflow: auto;
    box-shadow: 0 12px 28px rgba(0,0,0,.08);
  }
  .dd__item {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .dd__item:hover { background: #f6f7f9; }
  .dd__main { font-weight: 800; display:flex; gap:8px; align-items:center; }
  .dd__sub { font-size: 12px; opacity: .75; margin-top: 2px; }
  .dd__tag {
    font-size: 11px;
    font-weight: 900;
    opacity: .65;
    border: 1px solid #eee;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .dd__empty { padding: 10px 12px; opacity: .7; }
  
  /* table */
  .tableWrap {
    width: 100%;
    overflow-x: auto;
    border: 1px solid #eee;
    border-radius: 14px;
  }
  .table {
    width: 100%;
    min-width: 1100px; /* important for wide layout */
    border-collapse: collapse;
    table-layout: fixed;
  }
  th, td {
    border-bottom: 1px solid #f0f0f0;
    padding: 12px;
    vertical-align: top;
  }
  thead th {
    background: #fafafa;
    font-weight: 900;
    font-size: 13px;
  }
  .colNo { width: 52px; }
  .colType { width: 130px; }
  .colQty { width: 110px; }
  .colUnit { width: 160px; }
  .colTotal { width: 160px; }
  .colAct { width: 170px; }
  
  .tdNo { font-weight: 900; opacity: .75; }
  
  .infoBlock { display: flex; flex-direction: column; gap: 6px; }
  .grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .readPill {
    background: #f6f7f9;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 9px 10px;
    font-weight: 900;
  }
  
  .actRow {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .emptyRow {
    padding: 18px;
    text-align: center;
    opacity: .7;
  }
  
  /* buttons */
  .btn {
    border-radius: 12px;
    padding: 10px 12px;
    border: 1px solid #e6e6e6;
    background: #fff;
    cursor: pointer;
    font-weight: 800;
  }
  .btnPrimary {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .btnGhost { background: #fff; }
  .btnMini {
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px solid #e6e6e6;
    background: #fff;
    cursor: pointer;
    font-weight: 900;
    font-size: 12px;
  }
  .btnMiniDanger {
    border-color: #ffd7d7;
    background: #fff5f5;
    color: #b00020;
  }
  
  /* alert */
  .alert {
    border-radius: 14px;
    padding: 12px 14px;
    border: 1px solid;
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
  }
  .alert--error {
    border-color: #ffd7d7;
    background: #fff5f5;
    color: #b00020;
  }
  .alert__icon { font-size: 18px; }
  
  .footActions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 12px;
  }
  
  /* responsive */
  @media (max-width: 900px) {
    .row2 { grid-template-columns: 1fr; }
    .head { flex-direction: column; align-items: flex-start; }
    .head__actions { width: 100%; justify-content: flex-end; }
    .grid2 { grid-template-columns: 1fr; }
  }
  </style>