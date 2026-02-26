<template>
  <div class="page">
    <!-- Title -->
    <div class="titleRow">
      <button class="pill" type="button" @click="goList">← Back to list</button>
      <h1 class="h1">Products Purchase</h1>
    </div>

    <!-- Meta -->
    <div class="meta">
      <div class="metaItem">
        <span class="muted">Invoice No.:</span>
        <b class="mono">{{ purchase.invoiceNo || "-" }}</b>
      </div>

      <div class="metaItem">
        <span class="muted">Date:</span>
        <b>{{ purchase.date }}</b>
      </div>

      <div class="metaItem">
        <span class="muted">Payment:</span>
        <select v-model="purchase.paymentMethod" class="select" @change="saveAuto">
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="TRANSFER">Transfer</option>
          <option value="QR">QR</option>
        </select>
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
              <input
                v-model="search"
                class="search"
                placeholder="Search product by code or name"
                @focus="searchOpen = true"
                @blur="onBlurSearch"
              />
            </div>

            <div v-if="suggestions.length" class="suggestions">
              <button
                v-for="p in suggestions"
                :key="p.productId"
                class="sug"
                type="button"
                @click="selectProduct(p)"
              >
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
                    <button class="stepBtn" type="button" @click="selQty = Math.max(1, selQty - 1)">
                      −
                    </button>
                    <div class="stepVal">{{ selQty }}</div>
                    <button class="stepBtn" type="button" @click="selQty = selQty + 1">
                      +
                    </button>
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

              <button class="btn" type="button" @click="addItem">Add Item</button>
            </div>

            <div v-else class="muted" style="margin-top: 10px;">
              Pick a product to add.
            </div>
          </div>
        </div>

        <!-- Items List -->
        <div class="card mt">
          <div class="head">Items List</div>
          <div class="body">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:60px;">No.</th>
                  <th>Product</th>
                  <th class="right">Unit Price</th>
                  <th style="width:160px;">Qty</th>
                  <th class="right">Line Subtotal</th>
                  <th style="width:110px;" class="right">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(it, idx) in purchase.items" :key="it.id">
                  <td>{{ idx + 1 }}</td>

                  <td>
                    <div><b class="mono">{{ it.code }}</b> | {{ it.name }}</div>
                    <div class="small muted">
                      Available: {{ it.available }} | Weight: {{ it.weight }} | Color: {{ it.color }} | Dep: {{ it.dep }}
                    </div>
                    <div class="small muted">
                      Product ID: <b class="mono">{{ it.productId }}</b>
                    </div>
                  </td>

                  <td class="right">{{ money(it.unitPrice) }}</td>

                  <td>
                    <div class="stepper smallStep">
                      <button class="stepBtn" type="button" @click="setQty(it.id, it.qty - 1)">
                        −
                      </button>
                      <div class="stepVal">{{ it.qty }}</div>
                      <button class="stepBtn" type="button" @click="setQty(it.id, it.qty + 1)">
                        +
                      </button>
                    </div>
                  </td>

                  <td class="right">{{ money(it.unitPrice * it.qty) }}</td>

                  <td class="right">
                    <button class="iconBtn" type="button" @click="openEditPrice(it)">✎</button>
                    <button class="iconBtn" type="button" @click="removeItem(it.id)">🗑</button>
                  </td>
                </tr>

                <tr v-if="!purchase.items.length">
                  <td colspan="6" class="empty">No items yet.</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <button class="btn soft" type="button" @click="clearAll">Clear All</button>

              <div class="footerRight">
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
            <input class="input" v-model="purchase.customer.name" placeholder="Customer name" @input="saveAuto" />
            <input class="input" v-model="purchase.customer.phone" placeholder="Phone" @input="saveAuto" />

            <div class="small muted" style="margin-bottom: 10px;">
              Customer ID (backend):
              <input
                class="input"
                type="number"
                min="1"
                v-model.number="purchase.customer.customerId"
                @input="saveAuto"
              />
            </div>

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
              <button class="btn" type="button" @click="confirmSave">✅ Confirm & Save</button>
              <button class="btn soft" type="button" @click="printInvoice">🖨 Print Invoice</button>
            </div>

            <div class="small muted" style="margin-top: 10px;">
              This page saves to DB using your backend API. No localStorage.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit price modal -->
    <div v-if="priceModal.open" class="modalOverlay" @click.self="priceModal.open=false">
      <div class="modal">
        <b>Edit Unit Price</b>
        <input class="input" type="number" min="0" step="0.01" v-model.number="priceModal.price" />
        <div class="modalActions">
          <button class="btn soft" type="button" @click="priceModal.open=false">Cancel</button>
          <button class="btn" type="button" @click="applyPrice">Save</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePurchasesStore } from "@/stores/usePurchasesStore";
import type { Purchase, PurchaseItem } from "@/stores/usePurchasesStore";
import { http } from "@/services/http"; // ✅ ADD (use your existing http service)

/** ✅ Product type used in this page (same fields you already display) */
type Product = {
  productId: number;
  code: string;
  name: string;
  available: number;
  weight: string;
  color: string;
  dep: string;
  price: number;
};

const store = usePurchasesStore();
const route = useRoute();
const router = useRouter();

const purchase = reactive<Purchase>({
  id: "",
  invoiceId: undefined,
  invoiceNo: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Draft",
  paymentMethod: "CASH",
  customer: { name: "", phone: "", customerId: 1 },
  discount: 0,
  items: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/** ✅ REAL PRODUCTS FROM DB */
const productMaster = ref<Product[]>([]);

onMounted(async () => {
  // ✅ Load products from DB (same data as Products List)
  try {
    const productsFromDb = (await http<any[]>("/products")) ?? [];
    productMaster.value = productsFromDb.map((p: any) => ({
      productId: Number(p.id),
      code: String(p.code || ""),
      name: String(p.name || ""),
      available: Number(p.qty ?? 0),
      weight: p.weight != null ? String(p.weight) : "-",
      color: String(p.color || "-"),
      dep: p.depreciation != null ? String(p.depreciation) : "-",
      price: 0, // if you store selling price in DB, map it here
    }));
  } catch {
    productMaster.value = [];
  }

  const id = String(route.params.id || "");

  // If numeric -> load from DB
  const invoiceId = Number(id);
  if (!Number.isNaN(invoiceId) && invoiceId > 0) {
    const fromDb = await store.fetchOne(invoiceId);
    Object.assign(purchase, fromDb);
    store.upsertLocal({ ...purchase });
    return;
  }

  // Otherwise create new draft (memory only)
  const created = store.createPurchase();
  Object.assign(purchase, created);
});

const total = computed(() => store.totals(purchase));

function saveAuto() {
  store.upsertLocal({ ...purchase });
}

function goList() {
  router.push("/admin/purchases");
}

/** search + select product */
const search = ref("");
const selected = ref<Product | null>(null);
const selQty = ref(1);
const selPrice = ref(0);

/** ✅ Show suggestion when click search box */
const searchOpen = ref(false);
function onBlurSearch() {
  setTimeout(() => (searchOpen.value = false), 150); // let click work
}

const suggestions = computed(() => {
  if (!searchOpen.value) return [];
  const s = search.value.trim().toLowerCase();

  // ✅ When user just clicks (empty), show first products
  if (!s) return productMaster.value.slice(0, 6);

  return productMaster.value
    .filter((p) => `${p.code} ${p.name}`.toLowerCase().includes(s))
    .slice(0, 6);
});

function selectProduct(p: Product) {
  selected.value = p;
  selQty.value = 1;
  selPrice.value = p.price;
  search.value = ""; // keep your behavior
  searchOpen.value = false;
}

function addItem() {
  if (!selected.value) return;

  const p = selected.value;

  const item: PurchaseItem = {
    id: Math.random().toString(36).slice(2),
    productId: p.productId, // ✅ IMPORTANT for backend
    code: p.code,
    name: p.name,
    unitPrice: Number(selPrice.value || 0),
    qty: Number(selQty.value || 1),
    available: p.available,
    weight: p.weight,
    color: p.color,
    dep: p.dep,
  };

  purchase.items.push(item);
  saveAuto();
}

function setQty(itemId: string, qty: number) {
  const it = purchase.items.find((x) => x.id === itemId);
  if (!it) return;
  it.qty = Math.max(1, Number(qty || 1));
  saveAuto();
}

function removeItem(itemId: string) {
  purchase.items = purchase.items.filter((x) => x.id !== itemId);
  saveAuto();
}

function clearAll() {
  if (!confirm("Clear all items?")) return;
  purchase.items = [];
  purchase.discount = 0;
  saveAuto();
}

/** modal edit price */
const priceModal = reactive({ open: false, itemId: "", price: 0 });

function openEditPrice(it: PurchaseItem) {
  priceModal.open = true;
  priceModal.itemId = it.id;
  priceModal.price = it.unitPrice;
}

function applyPrice() {
  const it = purchase.items.find((x) => x.id === priceModal.itemId);
  if (it) it.unitPrice = Number(priceModal.price || 0);
  priceModal.open = false;
  saveAuto();
}

/** ✅ Confirm & Save to DB -> then Purchase List shows it */
async function confirmSave() {
  try {
    purchase.status = "Confirmed";
    const saved = await store.saveToDb({ ...purchase });
    Object.assign(purchase, saved);

    // ✅ go back to purchase list
    router.push("/admin/purchases");
  } catch (e: any) {
    alert(e?.message || "Confirm failed");
  }
}

function printInvoice() {
  const lines = purchase.items
    .map((it) => `${it.code} ${it.name} x${it.qty} = ${money(it.unitPrice * it.qty)}`)
    .join("\n");

  const msg =
`Invoice ${purchase.invoiceNo || "-"}
Date: ${purchase.date}
Status: ${purchase.status}
Payment: ${purchase.paymentMethod}

Customer: ${purchase.customer.name || "-"} (${purchase.customer.phone || "-"})
CustomerId: ${purchase.customer.customerId}

Items:
${lines}

Subtotal: ${money(total.value.subtotal)}
Discount: ${money(total.value.discount)}
Final: ${money(total.value.finalPrice)}
`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; white-space: pre-wrap;">${escapeHtml(msg)}</pre>`);
  w.document.close();
  w.print();
}

function escapeHtml(str: string) {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}
</script>

<style scoped>
.page { display:grid; gap:14px; }
.titleRow { display:flex; align-items:center; gap:12px; }
.h1 { margin:0; font-size: 32px; letter-spacing:-.5px; }

.pill { border:1px solid #e5e7eb; background:#fff; border-radius:999px; padding:8px 12px; font-weight:800; cursor:pointer; }
.muted { color:#6b7280; }
.small { font-size:12px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas; }

.meta {
  display:flex; gap:18px; flex-wrap:wrap; align-items:center;
  border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding: 12px 14px;
}
.metaItem { display:flex; gap:8px; align-items:center; }
.grow { margin-left:auto; }
.select { height:36px; border:1px solid #e5e7eb; border-radius:10px; padding:0 10px; font-weight:800; }

.grid { display:grid; grid-template-columns: 1fr 340px; gap:16px; }
.left { display:grid; gap:16px; }
.rightPanel { align-self:start; }

.card { border:1px solid #e5e7eb; border-radius:12px; background:#fff; overflow:hidden; }
.head { padding: 12px 14px; border-bottom:1px solid #e5e7eb; font-weight:900; background: #fafafa; }
.body { padding: 12px 14px; }

.searchWrap { position:relative; }
.icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); opacity:.6; }
.search {
  width:100%; height:38px; border:1px solid #e5e7eb; border-radius:10px;
  padding: 0 12px 0 36px;
}

.suggestions { margin-top:10px; display:grid; gap:8px; }
.sug { text-align:left; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; font-weight:700; }
.sug:hover { background:#f9fafb; }

.productRow {
  margin-top:12px;
  display:flex; gap:12px; align-items:flex-start; justify-content:space-between;
  border:1px solid #e5e7eb; border-radius:12px; padding: 12px;
}
.pLeft { display:grid; gap:10px; width:100%; }
.pTitle { display:flex; gap:10px; align-items:baseline; }
.code { color:#6b7280; font-weight:900; }
.pMeta { display:flex; gap:12px; flex-wrap:wrap; font-size:12px; color:#6b7280; }

.control { display:flex; gap:12px; align-items:center; }
.label { width: 110px; font-weight:900; color:#6b7280; }

.stepper {
  display:flex; align-items:center; height:34px;
  border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#fff;
}
.smallStep { height:32px; }
.stepBtn { width:38px; height:100%; border:none; background:#f3f4f6; font-weight:900; cursor:pointer; }
.stepVal { width:46px; text-align:center; font-weight:900; }

.price { height:34px; width: 140px; border:1px solid #e5e7eb; border-radius:10px; padding:0 10px; }

.table { width:100%; border-collapse:collapse; }
.table th, .table td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
.right { text-align:right; }
.empty { text-align:center; padding:16px; color:#6b7280; }

.footer { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:12px; }
.footerRight { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
.miniInput { height:34px; width: 120px; border:1px solid #e5e7eb; border-radius:10px; padding:0 10px; background:#fff; }
.finalBox { padding: 8px 12px; border-radius:10px; background:#111827; color:#fff; font-weight:900; }

.input {
  width:100%; height:38px; border:1px solid #e5e7eb; border-radius:10px; padding:0 12px;
  margin-bottom:10px;
}

.summary { border-top:1px solid #e5e7eb; margin-top:10px; padding-top:10px; display:grid; gap:10px; }
.sumRow { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.sumRow.big { font-size:18px; font-weight:900; }
.sumInput { height:34px; width: 140px; border:1px solid #e5e7eb; border-radius:10px; padding:0 10px; text-align:right; }

.btnStack { display:grid; gap:10px; margin-top:12px; }
.btn {
  height:38px; border-radius:10px; border:1px solid #e5e7eb;
  font-weight:900; cursor:pointer; background:#4b5563; color:#fff;
}
.btn.soft { background:#fff; color:#111827; }

.iconBtn {
  border:1px solid #e5e7eb; background:#fff; border-radius:10px;
  height:34px; width:40px; cursor:pointer; margin-left:6px;
}

.modalOverlay {
  position:fixed; inset:0; background:rgba(0,0,0,.35);
  display:grid; place-items:center; z-index: 50;
}
.modal {
  width: 360px; background:#fff; border-radius:12px; padding: 14px;
  border:1px solid #e5e7eb;
}
.modalActions { display:flex; gap:10px; justify-content:flex-end; margin-top:12px; }
</style>