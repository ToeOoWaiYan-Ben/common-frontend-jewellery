<template>
  <div class="page">
    <!-- Title -->
    <div class="titleRow">
      <button class="pill" @click="goList">← Back to list</button>
      <h1 class="h1">Products Purchase</h1>
    </div>

    <!-- Meta -->
    <div class="meta">
      <div class="metaItem">
        <span class="muted">Invoice No.:</span>
        <b class="mono">{{ purchase.invoiceNo }}</b>
      </div>

      <div class="metaItem">
        <span class="muted">Date:</span>
        <b>{{ purchase.date }}</b>
      </div>

      <div class="metaItem grow">
        <span class="muted">Status:</span>
        <select v-model="purchase.status" class="select" @change="saveAuto">
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
        </select>
      </div>
    </div>

    <div class="grid">
      <!-- LEFT -->
      <div class="left">
        <!-- Add Product -->
        <div class="card">
          <div class="head">Add Product</div>
          <div class="body">
            <div class="searchWrap">
              <span class="icon">🔎</span>
              <input v-model="search" class="search" placeholder="Search product by code or name" />
            </div>

            <div v-if="suggestions.length" class="suggestions">
              <button v-for="p in suggestions" :key="p.code" class="sug" @click="selectProduct(p)">
                <b class="mono">{{ p.code }}</b> | {{ p.name }}
              </button>
            </div>

            <div v-if="selected" class="productRow">
              <div class="pLeft">
                <div class="pTitle">
                  <span class="mono code">{{ selected.code }}</span>
                  <b>{{ selected.name }}</b>
                </div>

                <div class="pMeta">
                  <span>Available: {{ selected.available }}</span>
                  <span>Weight: {{ selected.weight }}</span>
                  <span>Color: {{ selected.color }}</span>
                  <span>Dep: {{ selected.dep }}</span>
                </div>

                <div class="control">
                  <span class="label">Qty</span>
                  <div class="stepper">
                    <button class="stepBtn" @click="selQty = Math.max(1, selQty - 1)">−</button>
                    <div class="stepVal">{{ selQty }}</div>
                    <button class="stepBtn" @click="selQty = selQty + 1">+</button>
                  </div>
                </div>

                <div class="control">
                  <span class="label">Selling Price</span>
                  <input
                    class="price"
                    type="number"
                    min="0"
                    step="0.01"
                    v-model.number="selPrice"
                  />
                </div>
              </div>

              <button class="btn" @click="addItem">Add Item</button>
            </div>

            <div v-else class="muted" style="margin-top: 10px">Pick a product to add.</div>
          </div>
        </div>

        <!-- Items List -->
        <div class="card mt">
          <div class="head">Items List</div>
          <div class="body">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 60px">No.</th>
                  <th>Product</th>
                  <th class="right">Unit Price</th>
                  <th style="width: 160px">Qty</th>
                  <th class="right">Line Subtotal</th>
                  <th style="width: 110px" class="right">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(it, idx) in purchase.items" :key="it.id">
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <div>
                      <b class="mono">{{ it.code }}</b> | {{ it.name }}
                    </div>
                    <div class="small muted">
                      Available: {{ it.available }} | Weight: {{ it.weight }} | Color:
                      {{ it.color }} | Dep: {{ it.dep }}
                    </div>
                  </td>
                  <td class="right">{{ money(it.unitPrice) }}</td>
                  <td>
                    <div class="stepper smallStep">
                      <button class="stepBtn" @click="setQty(it.id, it.qty - 1)">−</button>
                      <div class="stepVal">{{ it.qty }}</div>
                      <button class="stepBtn" @click="setQty(it.id, it.qty + 1)">+</button>
                    </div>
                  </td>
                  <td class="right">{{ money(it.unitPrice * it.qty) }}</td>
                  <td class="right">
                    <button class="iconBtn" @click="openEditPrice(it)">✎</button>
                    <button class="iconBtn" @click="removeItem(it.id)">🗑</button>
                  </td>
                </tr>

                <tr v-if="!purchase.items.length">
                  <td colspan="6" class="empty">No items yet.</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <button class="btn soft" @click="clearAll">Clear All</button>

              <div class="footerRight">
                <span class="muted">Promotion:</span>
                <input class="miniInput" disabled />

                <span class="muted">Discount:</span>
                <input
                  class="miniInput"
                  type="number"
                  min="0"
                  step="0.01"
                  v-model.number="purchase.discount"
                  @input="saveAuto"
                />

                <b>Final Price:</b>
                <div class="finalBox">{{ money(total.finalPrice) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="rightPanel">
        <div class="card">
          <div class="head">Customer</div>
          <div class="body">
            <input
              class="input"
              v-model="purchase.customer.name"
              placeholder="Search by phone or name (frontend)"
              @input="saveAuto"
            />
            <input
              class="input"
              v-model="purchase.customer.phone"
              placeholder="Phone"
              @input="saveAuto"
            />

            <div class="summary">
              <div class="sumRow">
                <span class="muted">Subtotal:</span>
                <b>{{ money(total.subtotal) }}</b>
              </div>
              <div class="sumRow">
                <span class="muted">Discount:</span>
                <input
                  class="sumInput"
                  type="number"
                  min="0"
                  step="0.01"
                  v-model.number="purchase.discount"
                  @input="saveAuto"
                />
              </div>
              <div class="sumRow big">
                <span>Final Price:</span>
                <b>{{ money(total.finalPrice) }}</b>
              </div>
            </div>

            <div class="btnStack">
              <button class="btn soft" @click="saveDraft">💾 Save Draft</button>
              <button class="btn" @click="confirmReduce">🔧 Confirm & Reduce Stock</button>
              <button class="btn soft" @click="printInvoice">🖨 Print Invoice</button>
            </div>

            <div class="small muted" style="margin-top: 10px">
              Reduce stock is simulated on frontend only.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit price modal -->
    <div v-if="priceModal.open" class="modalOverlay" @click.self="priceModal.open = false">
      <div class="modal">
        <b>Edit Unit Price</b>
        <input class="input" type="number" min="0" step="0.01" v-model.number="priceModal.price" />
        <div class="modalActions">
          <button class="btn soft" @click="priceModal.open = false">Cancel</button>
          <button class="btn" @click="applyPrice">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type { Purchase, PurchaseItem } from '@/stores/usePurchasesStore'
  import { usePurchasesStore } from '@/stores/usePurchasesStore'

  type Product = {
    code: string
    name: string
    available: number
    weight: string
    color: string
    dep: string
    price: number
  }

  // frontend demo products (replace later with API)
  const productMaster = ref<Product[]>([
    {
      code: 'PRD001',
      name: 'Product Name',
      available: 10,
      weight: '2.5g',
      color: 'Gold',
      dep: '0.5%',
      price: 100,
    },
    {
      code: 'PRD002',
      name: 'Product Name',
      available: 12,
      weight: '3.0g',
      color: 'Gold',
      dep: '0.5%',
      price: 150,
    },
    {
      code: 'PRD003',
      name: 'Product Name',
      available: 8,
      weight: '2.0g',
      color: 'Gold',
      dep: '0.5%',
      price: 200,
    },
  ])

  const store = usePurchasesStore()
  const route = useRoute()
  const router = useRouter()

  const purchase = reactive<Purchase>({
    id: '',
    invoiceNo: '',
    date: '',
    status: 'Draft',
    customer: { name: '', phone: '' },
    discount: 0,
    items: [],
    createdAt: 0,
    updatedAt: 0,
  })

  onMounted(() => {
    store.load()

    const id = String(route.params.id || '')
    if (id) {
      const exist = store.getById(id)
      if (exist) Object.assign(purchase, exist)
      else {
        const created = store.createPurchase()
        Object.assign(purchase, created)
        router.replace(`/purchases/${created.id}`)
      }
    } else {
      const created = store.createPurchase()
      Object.assign(purchase, created)
      router.replace(`/purchases/${created.id}`)
    }
  })

  const total = computed(() => store.totals(purchase))

  function saveAuto() {
    store.upsertPurchase({ ...purchase })
  }

  function goList() {
    router.push('/purchases')
  }

  // search + select
  const search = ref('')
  const selected = ref<Product | null>(null)
  const selQty = ref(1)
  const selPrice = ref(0)

  const suggestions = computed(() => {
    const s = search.value.trim().toLowerCase()
    if (!s) return []
    return productMaster.value
      .filter((p) => `${p.code} ${p.name}`.toLowerCase().includes(s))
      .slice(0, 6)
  })

  function selectProduct(p: Product) {
    selected.value = p
    selQty.value = 1
    selPrice.value = p.price
    search.value = ''
  }

  function addItem() {
    if (!selected.value) return

    const p = selected.value

    const item: PurchaseItem = {
      id: Math.random().toString(36).slice(2),
      code: p.code,
      name: p.name,
      unitPrice: Number(selPrice.value || 0),
      qty: Number(selQty.value || 1),
      available: p.available,
      weight: p.weight,
      color: p.color,
      dep: p.dep,
    }

    purchase.items.push(item)
    saveAuto()
  }

  function setQty(itemId: string, qty: number) {
    const it = purchase.items.find((x) => x.id === itemId)
    if (!it) return
    it.qty = Math.max(1, Number(qty || 1))
    saveAuto()
  }

  function removeItem(itemId: string) {
    purchase.items = purchase.items.filter((x) => x.id !== itemId)
    saveAuto()
  }

  function clearAll() {
    if (!confirm('Clear all items?')) return
    purchase.items = []
    purchase.discount = 0
    saveAuto()
  }

  // modal edit price
  const priceModal = reactive({ open: false, itemId: '', price: 0 })

  function openEditPrice(it: PurchaseItem) {
    priceModal.open = true
    priceModal.itemId = it.id
    priceModal.price = it.unitPrice
  }

  function applyPrice() {
    const it = purchase.items.find((x) => x.id === priceModal.itemId)
    if (it) it.unitPrice = Number(priceModal.price || 0)
    priceModal.open = false
    saveAuto()
  }

  // right actions
  function saveDraft() {
    purchase.status = 'Draft'
    saveAuto()
    alert('Saved as Draft (localStorage).')
  }

  function confirmReduce() {
    purchase.status = 'Confirmed'

    // simulate reduce stock (frontend only)
    for (const it of purchase.items) {
      const prod = productMaster.value.find((p) => p.code === it.code)
      if (prod) prod.available = Math.max(0, prod.available - it.qty)
    }

    saveAuto()
    alert('Confirmed (simulated). Stock reduced in frontend memory.')
  }

  function printInvoice() {
    const lines = purchase.items
      .map((it) => `${it.code} ${it.name} x${it.qty} = ${money(it.unitPrice * it.qty)}`)
      .join('\n')

    const msg = `Invoice ${purchase.invoiceNo}
Date: ${purchase.date}
Status: ${purchase.status}

Customer: ${purchase.customer.name || '-'} (${purchase.customer.phone || '-'})

Items:
${lines}

Subtotal: ${money(total.value.subtotal)}
Discount: ${money(total.value.discount)}
Final: ${money(total.value.finalPrice)}
`

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(
      `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; white-space: pre-wrap;">${escapeHtml(msg)}</pre>`
    )
    w.document.close()
    w.print()
  }

  function escapeHtml(str: string) {
    return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  }

  function money(n: number) {
    return `$${Number(n || 0).toFixed(2)}`
  }
</script>

<style scoped>
  .page {
    display: grid;
    gap: 14px;
  }
  .titleRow {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .h1 {
    margin: 0;
    font-size: 32px;
    letter-spacing: -0.5px;
  }

  .pill {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 999px;
    padding: 8px 12px;
    font-weight: 800;
    cursor: pointer;
  }
  .muted {
    color: #6b7280;
  }
  .small {
    font-size: 12px;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
  }

  .meta {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    padding: 12px 14px;
  }
  .metaItem {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .grow {
    margin-left: auto;
  }
  .select {
    height: 36px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 10px;
    font-weight: 800;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 16px;
  }
  .left {
    display: grid;
    gap: 16px;
  }
  .rightPanel {
    align-self: start;
  }

  .card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
  }
  .head {
    padding: 12px 14px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 900;
    background: #fafafa;
  }
  .body {
    padding: 12px 14px;
  }

  .searchWrap {
    position: relative;
  }
  .icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.6;
  }
  .search {
    width: 100%;
    height: 38px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 12px 0 36px;
  }

  .suggestions {
    margin-top: 10px;
    display: grid;
    gap: 8px;
  }
  .sug {
    text-align: left;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    font-weight: 700;
  }
  .sug:hover {
    background: #f9fafb;
  }

  .productRow {
    margin-top: 12px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px;
  }
  .pLeft {
    display: grid;
    gap: 10px;
    width: 100%;
  }
  .pTitle {
    display: flex;
    gap: 10px;
    align-items: baseline;
  }
  .code {
    color: #6b7280;
    font-weight: 900;
  }
  .pMeta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #6b7280;
  }

  .control {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .label {
    width: 110px;
    font-weight: 900;
    color: #6b7280;
  }

  .stepper {
    display: flex;
    align-items: center;
    height: 34px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .smallStep {
    height: 32px;
  }
  .stepBtn {
    width: 38px;
    height: 100%;
    border: none;
    background: #f3f4f6;
    font-weight: 900;
    cursor: pointer;
  }
  .stepVal {
    width: 46px;
    text-align: center;
    font-weight: 900;
  }

  .price {
    height: 34px;
    width: 140px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 10px;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }
  .table th,
  .table td {
    padding: 10px 8px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  .right {
    text-align: right;
  }
  .empty {
    text-align: center;
    padding: 16px;
    color: #6b7280;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
  }
  .footerRight {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .miniInput {
    height: 34px;
    width: 120px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 10px;
    background: #fff;
  }
  .finalBox {
    padding: 8px 12px;
    border-radius: 10px;
    background: #111827;
    color: #fff;
    font-weight: 900;
  }

  .input {
    width: 100%;
    height: 38px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 12px;
    margin-bottom: 10px;
  }

  .summary {
    border-top: 1px solid #e5e7eb;
    margin-top: 10px;
    padding-top: 10px;
    display: grid;
    gap: 10px;
  }
  .sumRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .sumRow.big {
    font-size: 18px;
    font-weight: 900;
  }
  .sumInput {
    height: 34px;
    width: 140px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 10px;
    text-align: right;
  }

  .btnStack {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }
  .btn {
    height: 38px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    font-weight: 900;
    cursor: pointer;
    background: #4b5563;
    color: #fff;
  }
  .btn.soft {
    background: #fff;
    color: #111827;
  }
  .mt {
    margin-top: 0;
  }

  .iconBtn {
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 10px;
    height: 34px;
    width: 40px;
    cursor: pointer;
    margin-left: 6px;
  }

  .modalOverlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    z-index: 50;
  }
  .modal {
    width: 360px;
    background: #fff;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #e5e7eb;
  }
  .modalActions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 12px;
  }
</style>
