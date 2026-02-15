<template>
  <div class="pwrap" @click="closeAllDd">
    <!-- header -->
    <div class="phead">
      <button class="phead__back" type="button" @click="goBack">← Back to products</button>
    </div>

    <div class="ptitle">
      <h2 class="ptitle__h">{{ isEdit ? 'Edit product' : 'Add product' }}</h2>
      <p class="ptitle__p">Create product + add gold sources + add jewellery sources.</p>
    </div>

    <!-- MAIN PRODUCT CARD -->
    <div class="pcard">
      <div class="pgrid">
        <div class="pfield">
          <label class="plabel">Name *</label>
          <input v-model="product.name" class="pinput" type="text" placeholder="e.g. Gold Ring 18K" />
        </div>

        <div class="pfield">
          <label class="plabel">Code</label>
          <input v-model="product.code" class="pinput" type="text" placeholder="e.g. GR-001" />
        </div>

        <div class="pfield">
          <label class="plabel">Stock Status</label>
          <div class="pselectWrap">
            <select v-model="product.stockStatus" class="pselect">
              <option value="">Select status</option>
              <option value="IN_STOCK">IN_STOCK</option>
              <option value="LOW_STOCK">LOW_STOCK</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            </select>
            <span class="pselectIcon">▾</span>
          </div>
        </div>

        <div class="pfield">
          <label class="plabel">Qty</label>
          <input v-model.number="product.qty" class="pinput" type="number" min="0" placeholder="e.g. 10" />
        </div>

        <div class="pfield">
          <label class="plabel">Collection</label>
          <input v-model="product.collection" class="pinput" type="text" placeholder="e.g. Classic" />
        </div>

        <div class="pfield">
          <label class="plabel">Color</label>
          <input v-model="product.color" class="pinput" type="text" placeholder="e.g. Yellow Gold" />
        </div>

        <div class="pfield">
          <label class="plabel">Weight</label>
          <input
            v-model.number="product.weight"
            class="pinput"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 5.20"
          />
        </div>

        <div class="pfield">
          <label class="plabel">Metarial Loss</label>
          <input
            v-model.number="product.metarialLoss"
            class="pinput"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 0.30"
          />
        </div>

        <div class="pfield">
          <label class="plabel">Making Cost</label>
          <input
            v-model.number="product.makingCost"
            class="pinput"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 120"
          />
        </div>

        <div class="pfield">
          <label class="plabel">Color Count</label>
          <input v-model.number="product.colorCount" class="pinput" type="number" min="0" placeholder="e.g. 2" />
        </div>

        <div class="pfield">
          <label class="plabel">Depreciation *</label>
          <input
            v-model.number="product.depreciation"
            class="pinput"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 0.10"
          />
        </div>

        <div class="pfield">
          <label class="plabel">Product Type ID *</label>
          <input v-model.number="product.productTypeId" class="pinput" type="number" min="1" placeholder="e.g. 1" />
        </div>

        <div class="pfield pfield--full">
          <label class="plabel">Short Desc</label>
          <input v-model="product.shortDesc" class="pinput" type="text" placeholder="e.g. 18K ring with clean design" />
        </div>

        <div class="pfield pfield--full">
          <label class="plabel">Desc (varchar300)</label>
          <textarea v-model="product.desc" class="ptextarea" rows="3" placeholder="Write product description..."></textarea>
        </div>
      </div>
    </div>

    <!-- ADD GOLD FOR PRODUCT -->
    <div class="pcard">
      <div class="secHead">
        <div>
          <h3 class="secHead__h">Add Gold For Product</h3>
          <p class="secHead__p">Choose purchased gold package (Gold Source) + craft, enter used weight + current price.</p>
        </div>

        <div class="purityPill" :class="purityClass">
          <span class="purityPill__dot"></span>
          <span class="purityPill__text">{{ goldPurityLabel }}</span>
        </div>
      </div>

      <div v-if="goldError" class="errBox">
        <span class="errBox__icon">⚠</span>
        <span>{{ goldError }}</span>
      </div>

      <div class="miniTable">
        <div class="miniTable__head miniTable__head--gold">
          <div class="miniTable__th">Gold Source *</div>
          <div class="miniTable__th">Craft *</div>
          <div class="miniTable__th">Weight Used (kyat/g) *</div>
          <div class="miniTable__th">Current Price (MMK) *</div>
          <div class="miniTable__th miniTable__th--actions">
            <button class="btnAdd" type="button" @click.stop="addGoldRow">+ Add</button>
          </div>
        </div>

        <div v-for="(row, idx) in product.goldRows" :key="row.key" class="miniTable__row miniTable__row--gold">
          <!-- GOLD SOURCE -->
          <div class="miniTable__td">
            <div class="combo" @click.stop>
              <button class="combo__btn" type="button" @click.stop="toggleGoldDd(idx)">
                <span class="combo__text">{{ row.sourceLabel || 'Select gold package' }}</span>
                <span class="combo__icon">▾</span>
              </button>

              <div v-if="row.ddOpen" class="dd dd--up" @click.stop>
                <div class="dd__search">
                  <span class="dd__searchIcon">🔍</span>
                  <input v-model="row.query" class="dd__searchInput" type="text" placeholder="Search package id / merchant..." />
                </div>

                <div class="dd__list">
                  <button
                    v-for="g in filteredGoldSources(row.query)"
                    :key="g.id"
                    class="dd__item"
                    type="button"
                    @click.stop="selectGoldSource(idx, g)"
                  >
                    <div class="dd__main">{{ g.name }}</div>
                    <div class="dd__sub">
                      {{ g.sourceCountry || '-' }} • Available: {{ Number(g.weight || 0).toFixed(2) }} • Purity:
                      {{ g.goldPurity || '-' }}
                    </div>
                  </button>

                  <div v-if="filteredGoldSources(row.query).length === 0" class="dd__empty">No gold packages found</div>
                </div>
              </div>
            </div>
          </div>

          <!-- CRAFT -->
          <div class="miniTable__td">
            <div class="combo" @click.stop>
              <button class="combo__btn" type="button" @click.stop="toggleCraftDd(idx)">
                <span class="combo__text">{{ row.craftLabel || 'Select craft' }}</span>
                <span class="combo__icon">▾</span>
              </button>

              <div v-if="row.craftDdOpen" class="dd dd--up" @click.stop>
                <div class="dd__search">
                  <span class="dd__searchIcon">🔍</span>
                  <input v-model="row.craftQuery" class="dd__searchInput" type="text" placeholder="Search shop name / NRC / phone..." />
                </div>

                <div class="dd__list">
                  <button
                    v-for="c in filteredCrafts(row.craftQuery)"
                    :key="c.id"
                    class="dd__item"
                    type="button"
                    @click.stop="selectCraft(idx, c)"
                  >
                    <div class="dd__main">{{ c.shopName }}</div>
                    <div class="dd__sub">NRC: {{ c.nrc }} • Phone: {{ c.phone }}</div>
                  </button>

                  <div v-if="filteredCrafts(row.craftQuery).length === 0" class="dd__empty">No crafts found</div>
                </div>
              </div>
            </div>

            <div v-if="row.craftError" class="tinyErr">{{ row.craftError }}</div>
          </div>

          <!-- WEIGHT -->
          <div class="miniTable__td">
            <input
              v-model.number="row.weightUsed"
              class="pinput pinput--tight"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 4.0"
              @input="validateGoldRows"
            />
            <div v-if="row.weightError" class="tinyErr">{{ row.weightError }}</div>
          </div>

          <!-- PRICE -->
          <div class="miniTable__td">
            <input
              v-model.number="row.currentPrice"
              class="pinput pinput--tight"
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 4000"
              @input="validateGoldRows"
            />
            <div v-if="row.priceError" class="tinyErr">{{ row.priceError }}</div>
          </div>

          <div class="miniTable__td miniTable__td--actions">
            <button class="btnDel" type="button" @click.stop="removeGoldRow(idx)">Delete</button>
          </div>
        </div>
      </div>

      <div class="totals">
        <div class="totals__box">
          <div class="totals__label">Total Weight Used</div>
          <div class="totals__value">{{ totalGoldWeight.toFixed(2) }}</div>
        </div>

        <div class="totals__box">
          <div class="totals__label">Total Current Price</div>
          <div class="totals__value">{{ totalGoldPrice.toLocaleString() }} MMK</div>
        </div>

        <div class="totals__box">
          <div class="totals__label"> </div>
          <div class="totals__value"> </div>
        </div>
      </div>
    </div>

    <!-- ADD JEWELLERY FOR PRODUCT -->
    <div class="pcard">
      <div class="secHead">
        <div>
          <h3 class="secHead__h">Add Jewellery For Product</h3>
          <p class="secHead__p">Choose jewellery source, enter qty + selling price. Unit price comes from gem package.</p>
        </div>
      </div>

      <div v-if="jewelryError" class="errBox">
        <span class="errBox__icon">⚠</span>
        <span>{{ jewelryError }}</span>
      </div>

      <div class="miniTable">
        <div class="miniTable__head miniTable__head--wide">
          <div class="miniTable__th">Jewellery Source *</div>
          <div class="miniTable__th">Qty *</div>
          <div class="miniTable__th">Unit Weight</div>
          <div class="miniTable__th">Total Weight</div>
          <div class="miniTable__th">Selling Price *</div>
          <div class="miniTable__th">Original Price</div>
          <div class="miniTable__th miniTable__th--actions">
            <button class="btnAdd" type="button" @click.stop="addJewelryRow">+ Add</button>
          </div>
        </div>

        <div v-for="(row, idx) in product.jewelryRows" :key="row.key" class="miniTable__row miniTable__row--wide">
          <div class="miniTable__td">
            <div class="combo" @click.stop>
              <button class="combo__btn" type="button" @click.stop="toggleJewelryDd(idx)">
                <span class="combo__text">{{ row.sourceLabel || 'Select jewellery package' }}</span>
                <span class="combo__icon">▾</span>
              </button>

              <div v-if="row.ddOpen" class="dd dd--up" @click.stop>
                <div class="dd__search">
                  <span class="dd__searchIcon">🔍</span>
                  <input v-model="row.query" class="dd__searchInput" type="text" placeholder="Search package name / gem type..." />
                </div>

                <div class="dd__list">
                  <button
                    v-for="p in filteredGemPackages(row.query)"
                    :key="p.id"
                    class="dd__item"
                    type="button"
                    @click.stop="selectJewelryPackage(idx, p)"
                  >
                    <div class="dd__main">{{ p.name }}</div>
                    <div class="dd__sub">
                      {{ p.gemTypeName || '-' }} • Available Qty: {{ Number(p.quantity ?? 0) }} • Unit Wt:
                      {{ Number(p.gemsSize ?? 0).toFixed(4) }} • Unit Price:
                      {{ unitPriceFromPackage(p).toLocaleString() }}
                    </div>
                  </button>

                  <div v-if="filteredGemPackages(row.query).length === 0" class="dd__empty">No jewellery packages found</div>
                </div>
              </div>
            </div>
          </div>

          <div class="miniTable__td">
            <input
              v-model.number="row.qty"
              class="pinput pinput--tight"
              type="number"
              min="0"
              placeholder="e.g. 3"
              @input="validateJewelryRows"
            />
            <div v-if="row.qtyError" class="tinyErr">{{ row.qtyError }}</div>
          </div>

          <div class="miniTable__td">
            <div class="readPill">{{ row.unitWeight || 0 }}</div>
          </div>

          <div class="miniTable__td">
            <div class="readPill">{{ (Number(row.unitWeight || 0) * Number(row.qty || 0)).toFixed(2) }}</div>
          </div>

          <div class="miniTable__td">
            <input
              v-model.number="row.sellingPrice"
              class="pinput pinput--tight"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 350000"
              @input="validateJewelryRows"
            />
            <div v-if="row.sellError" class="tinyErr">{{ row.sellError }}</div>
          </div>

          <div class="miniTable__td">
            <div class="readPill readPill--muted">{{ (row.unitPrice ?? 0).toLocaleString() }}</div>
          </div>

          <div class="miniTable__td miniTable__td--actions">
            <button class="btnDel" type="button" @click.stop="removeJewelryRow(idx)">Delete</button>
          </div>
        </div>
      </div>

      <div class="totals">
        <div class="totals__box">
          <div class="totals__label">Total Jewellery Qty</div>
          <div class="totals__value">{{ totalJewelryQty }}</div>
        </div>

        <div class="totals__box">
          <div class="totals__label">Total Jewellery Weight</div>
          <div class="totals__value">{{ totalJewelryWeight.toFixed(2) }}</div>
        </div>

        <div class="totals__box">
          <div class="totals__label">Total Selling Price</div>
          <div class="totals__value">{{ totalSellingPrice.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- SAVE -->
    <div class="saveBar">
      <div class="saveBar__left"></div>
      <div class="saveBar__right">
        <button class="btnGhost" type="button" @click="goBack">Cancel</button>
        <button class="btnPrimary" type="button" @click="onSaveAll">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { http } from '../services/http'
import type { GoldSourceDto } from '../dtos/GoldSourceDto'
import type { GemsPackageDto } from '../dtos/GemsPackageDto'
import type { CraftDto } from '../dtos/CraftDto'
import { useProductsStore } from '../stores/useProductsStore'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)

const productsStore = useProductsStore()

type GoldRow = {
  key: string
  ddOpen: boolean
  query: string
  goldSourceId: number | null
  sourceLabel: string
  purity: string
  availableWeight: number
  weightUsed: number
  currentPrice: number
  weightError: string
  priceError: string

  craftDdOpen: boolean
  craftQuery: string
  craftId: number | null
  craftLabel: string
  craftError: string
}

type JewelryRow = {
  key: string
  ddOpen: boolean
  query: string
  gemsPackageId: number | null
  sourceLabel: string
  availableQty: number
  unitWeight: number
  unitPrice: number
  qty: number
  sellingPrice: number
  qtyError: string
  sellError: string
}

const product = reactive({
  id: 0,
  name: '',
  code: '',
  stockStatus: '',
  desc: '',
  qty: 0,
  collection: '',
  shortDesc: '',
  color: '',
  weight: 0,
  metarialLoss: 0,
  makingCost: 0,
  colorCount: 0,
  depreciation: 0,
  productTypeId: null as number | null,

  goldRows: [
    {
      key: crypto.randomUUID(),
      ddOpen: false,
      query: '',
      goldSourceId: null,
      sourceLabel: '',
      purity: '',
      availableWeight: 0,
      weightUsed: 0,
      currentPrice: 0,
      weightError: '',
      priceError: '',

      craftDdOpen: false,
      craftQuery: '',
      craftId: null,
      craftLabel: '',
      craftError: '',
    },
  ] as GoldRow[],

  jewelryRows: [
    {
      key: crypto.randomUUID(),
      ddOpen: false,
      query: '',
      gemsPackageId: null,
      sourceLabel: '',
      availableQty: 0,
      unitWeight: 0,
      unitPrice: 0,
      qty: 0,
      sellingPrice: 0,
      qtyError: '',
      sellError: '',
    },
  ] as JewelryRow[],
})

const goldSources = ref<GoldSourceDto[]>([])
const gemsPackages = ref<GemsPackageDto[]>([])
const crafts = ref<CraftDto[]>([])

onMounted(async () => {
  try {
    goldSources.value = (await http<GoldSourceDto[]>('/gold-source')) ?? []
  } catch {
    goldSources.value = []
  }

  try {
    gemsPackages.value = (await http<GemsPackageDto[]>('/gems-packages')) ?? []
  } catch {
    gemsPackages.value = []
  }

  try {
    crafts.value = (await http<CraftDto[]>('/crafts')) ?? []
  } catch {
    crafts.value = []
  }
})

/** ✅ IMPORTANT FIX: convert "18 K" / "24K" -> 18 / 24 (Float) */
const parseGoldPurityToFloat = (val: any): number => {
  if (val == null) return 0
  if (typeof val === 'number') return val
  const s = String(val).trim()
  const m = s.match(/(\d+(\.\d+)?)/) // first number
  if (!m) return 0
  return Number(m[1])
}

const unitPriceFromPackage = (p: any) => {
  const direct = Number(p.unitPrice ?? p.unit_price ?? p.pricePerUnit ?? p.unit_price_mmk ?? NaN)
  if (!Number.isNaN(direct)) return direct

  const total = Number(p.originalPrice ?? p.original_price ?? 0)
  const qty = Number(p.quantity ?? 0)
  if (qty > 0) return Math.round(total / qty)

  return 0
}

// ----- GOLD -----
const goldError = ref<string | null>(null)

const totalGoldWeight = computed(() => product.goldRows.reduce((sum, r) => sum + (Number(r.weightUsed) || 0), 0))
const totalGoldPrice = computed(() => product.goldRows.reduce((sum, r) => sum + (Number(r.currentPrice) || 0), 0))

const goldPurityLabel = computed(() => {
  const purities = product.goldRows.map((r) => (r.purity || '').trim()).filter(Boolean)
  if (purities.length === 0) return 'Purity: not set'
  const unique = Array.from(new Set(purities))
  if (unique.length === 1) return `Purity: ${unique[0]}`
  return 'Purity: MIXED'
})

const purityClass = computed(() => {
  const t = goldPurityLabel.value
  if (t.includes('18')) return 'purityPill--18'
  if (t.includes('24')) return 'purityPill--24'
  if (t.includes('MIXED')) return 'purityPill--mix'
  return 'purityPill--none'
})

const filteredGoldSources = (q: string) => {
  const term = (q || '').trim().toLowerCase()
  if (!term) return goldSources.value
  return goldSources.value.filter(
    (g) =>
      (g.name || '').toLowerCase().includes(term) ||
      (g.sourceCountry || '').toLowerCase().includes(term) ||
      (g.color || '').toLowerCase().includes(term) ||
      String(g.id).includes(term)
  )
}

const filteredCrafts = (q: string) => {
  const term = (q || '').trim().toLowerCase()
  if (!term) return crafts.value
  return crafts.value.filter(
    (c) =>
      (c.shopName || '').toLowerCase().includes(term) ||
      (c.nrc || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term) ||
      String(c.id).includes(term)
  )
}

const toggleGoldDd = (idx: number) => {
  product.goldRows.forEach((r, i) => (r.ddOpen = i === idx ? !r.ddOpen : false))
  product.goldRows.forEach((r) => (r.craftDdOpen = false))
  product.jewelryRows.forEach((r) => (r.ddOpen = false))
}

const toggleCraftDd = (idx: number) => {
  product.goldRows.forEach((r, i) => (r.craftDdOpen = i === idx ? !r.craftDdOpen : false))
  product.goldRows.forEach((r) => (r.ddOpen = false))
  product.jewelryRows.forEach((r) => (r.ddOpen = false))
}

const selectGoldSource = (idx: number, g: GoldSourceDto) => {
  const row = product.goldRows[idx]
  row.goldSourceId = g.id
  row.sourceLabel = g.name || ''
  row.purity = (g as any).goldPurity || ''
  row.availableWeight = Number((g as any).weight ?? 0)
  row.ddOpen = false
  row.query = ''
  validateGoldRows()
}

const selectCraft = (idx: number, c: CraftDto) => {
  const row = product.goldRows[idx]
  row.craftId = (c as any).id
  row.craftLabel = (c as any).shopName || ''
  row.craftDdOpen = false
  row.craftQuery = ''
  validateGoldRows()
}

const addGoldRow = () => {
  product.goldRows.push({
    key: crypto.randomUUID(),
    ddOpen: false,
    query: '',
    goldSourceId: null,
    sourceLabel: '',
    purity: '',
    availableWeight: 0,
    weightUsed: 0,
    currentPrice: 0,
    weightError: '',
    priceError: '',

    craftDdOpen: false,
    craftQuery: '',
    craftId: null,
    craftLabel: '',
    craftError: '',
  })
  validateGoldRows()
}

const removeGoldRow = (idx: number) => {
  if (product.goldRows.length === 1) return
  product.goldRows.splice(idx, 1)
  validateGoldRows()
}

const validateGoldRows = () => {
  goldError.value = null
  let hasAnyError = false

  product.goldRows.forEach((r) => {
    r.weightError = ''
    r.priceError = ''
    r.craftError = ''

    if (!r.craftId) {
      r.craftError = 'Craft is required.'
      hasAnyError = true
    }

    if (!r.goldSourceId) {
      hasAnyError = true
      return
    }

    if ((r.weightUsed ?? 0) <= 0) {
      r.weightError = 'Weight is required.'
      hasAnyError = true
    } else if (r.availableWeight > 0 && r.weightUsed > r.availableWeight) {
      r.weightError = `Exceeds available weight (${r.availableWeight}).`
      hasAnyError = true
    }

    if ((r.currentPrice ?? 0) <= 0) {
      r.priceError = 'Current price is required.'
      hasAnyError = true
    }

    // ✅ ensure purity can be converted to float (not 0)
    const purityVal = parseGoldPurityToFloat(r.purity)
    if (purityVal <= 0) {
      hasAnyError = true
    }
  })

  if (hasAnyError) goldError.value = 'Please fill the Gold Information !!.'
}

// ----- JEWELLERY -----
const jewelryError = ref<string | null>(null)

const filteredGemPackages = (q: string) => {
  const term = (q || '').trim().toLowerCase()
  if (!term) return gemsPackages.value
  return gemsPackages.value.filter(
    (p: any) =>
      (p.name || '').toLowerCase().includes(term) ||
      (p.gemTypeName || '').toLowerCase().includes(term) ||
      String(p.id).includes(term)
  )
}

const toggleJewelryDd = (idx: number) => {
  product.jewelryRows.forEach((r, i) => (r.ddOpen = i === idx ? !r.ddOpen : false))
  product.goldRows.forEach((r) => (r.ddOpen = false))
  product.goldRows.forEach((r) => (r.craftDdOpen = false))
}

const selectJewelryPackage = (idx: number, p: GemsPackageDto) => {
  const row = product.jewelryRows[idx]
  row.gemsPackageId = (p as any).id
  row.sourceLabel = (p as any).name || ''
  row.availableQty = Number((p as any).quantity ?? 0)
  row.unitWeight = Number((p as any).gemsSize ?? 0)
  row.unitPrice = unitPriceFromPackage(p as any)
  row.ddOpen = false
  row.query = ''
  validateJewelryRows()
}

const addJewelryRow = () => {
  product.jewelryRows.push({
    key: crypto.randomUUID(),
    ddOpen: false,
    query: '',
    gemsPackageId: null,
    sourceLabel: '',
    availableQty: 0,
    unitWeight: 0,
    unitPrice: 0,
    qty: 0,
    sellingPrice: 0,
    qtyError: '',
    sellError: '',
  })
  validateJewelryRows()
}

const removeJewelryRow = (idx: number) => {
  if (product.jewelryRows.length === 1) return
  product.jewelryRows.splice(idx, 1)
  validateJewelryRows()
}

const validateJewelryRows = () => {
  jewelryError.value = null
  let hasAnyError = false

  product.jewelryRows.forEach((r) => {
    r.qtyError = ''
    r.sellError = ''

    if (!r.gemsPackageId) {
      hasAnyError = true
      return
    }

    if ((r.qty ?? 0) <= 0) {
      r.qtyError = 'Qty is required.'
      hasAnyError = true
    } else if (r.availableQty > 0 && r.qty > r.availableQty) {
      r.qtyError = `Exceeds available qty (${r.availableQty}).`
      hasAnyError = true
    }

    if ((r.sellingPrice ?? 0) <= 0) {
      r.sellError = 'Selling price is required.'
      hasAnyError = true
    }
  })

  if (hasAnyError) jewelryError.value = 'Please fill the Jewellery Information !!.'
}

const totalJewelryQty = computed(() => product.jewelryRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0))
const totalJewelryWeight = computed(() =>
  product.jewelryRows.reduce((sum, r) => sum + (Number(r.qty) || 0) * (Number(r.unitWeight) || 0), 0)
)
const totalSellingPrice = computed(() => product.jewelryRows.reduce((sum, r) => sum + (Number(r.sellingPrice) || 0), 0))

// ----- UI -----
const closeAllDd = () => {
  product.goldRows.forEach((r) => (r.ddOpen = false))
  product.goldRows.forEach((r) => (r.craftDdOpen = false))
  product.jewelryRows.forEach((r) => (r.ddOpen = false))
}

const goBack = () => router.push('/admin/products')

const onSaveAll = async () => {
  if (!String(product.name || '').trim()) return alert('Product name is required.')
  if (!product.productTypeId || Number(product.productTypeId) <= 0) return alert('Product Type ID is required.')
  if (product.depreciation == null || Number(product.depreciation) <= 0) return alert('Depreciation is required.')

  validateGoldRows()
  validateJewelryRows()

  const goldMissing = product.goldRows.some((r) => !r.goldSourceId || !r.craftId)
  const jewMissing = product.jewelryRows.some((r) => !r.gemsPackageId)

  if (goldMissing) return (goldError.value = 'Please choose Gold Source + Craft for every row.')
  if (jewMissing) return (jewelryError.value = 'Please choose Jewellery package for every row.')
  if (goldError.value || jewelryError.value) return

  try {
    await productsStore.createProduct({
      name: product.name,
      code: product.code,
      stockStatus: product.stockStatus,
      desc: product.desc,
      qty: Number(product.qty ?? 0),
      collection: product.collection,
      shortDesc: product.shortDesc,
      color: product.color,
      weight: Number(product.weight ?? 0),
      metarialLoss: Number(product.metarialLoss ?? 0),
      makingCost: Number(product.makingCost ?? 0),
      colorCount: Number(product.colorCount ?? 0),
      depreciation: Number(product.depreciation ?? 0),
      productTypeId: Number(product.productTypeId ?? 1),

      // ✅ FIXED HERE: goldPurity must be FLOAT, not "18 K"
      productGolds: product.goldRows.map((r) => ({
        goldSourceId: r.goldSourceId!,
        craftId: r.craftId!,
        weight: Number(r.weightUsed ?? 0),
        goldPurity: parseGoldPurityToFloat(r.purity), // ✅ Float
      })),

      productJewellerys: product.jewelryRows.map((r) => ({
        gemsPackageId: r.gemsPackageId!,
        qty: Number(r.qty ?? 0),
        sellingPrice: Number(r.sellingPrice ?? 0),
      })),
    } as any)

    await productsStore.loadProducts()
    alert('Saved successfully!')
    goBack()
  } catch (e: any) {
    alert(e?.message ?? 'Failed to save product.')
  }
}
</script>
<style scoped>
/* =========================================================
   ✅ GOLD TABLE FIX (Put this at the TOP)
   Reason: your generic .miniTable__head overrides the gold grid.
   We use higher-specificity selectors: .miniTable__head.miniTable__head--gold
   ========================================================= */

/* ✅ force GOLD header + rows to be 5 columns (Gold | Craft | Weight | Price | Actions) */
.miniTable__head.miniTable__head--gold,
.miniTable__row.miniTable__row--gold {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.9fr 0.9fr 170px;
  gap: 0;
  align-items: center; /* vertically center like Jewellery table */
}

/* ✅ move +Add and Delete to the right corner */
.miniTable__head.miniTable__head--gold .miniTable__th--actions,
.miniTable__row.miniTable__row--gold .miniTable__td--actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 16px;
  padding-left: 0;
}

/* ✅ make buttons consistent + avoid wrapping */
.btnAdd,
.btnDel {
  white-space: nowrap;
  min-width: 92px;
}

/* ✅ keep dropdown above everything */
.combo { position: relative; }
.dd { z-index: 9999; }

/* =========================================================
   ✅ KEEP ALL YOUR EXISTING CSS BELOW (no breaking changes)
   ========================================================= */

.pwrap { background:#f3f4f6; min-height:100vh; padding:18px 18px 30px; }
.phead { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:16px; padding:14px; }
.phead__back { border:none; background:transparent; cursor:pointer; font-weight:900; color:#2563eb; }

.ptitle { margin:12px 2px 14px; }
.ptitle__h { margin:0; font-size:22px; font-weight:900; color:#111827; }
.ptitle__p { margin:4px 0 0; font-size:13px; color:#6b7280; }

.pcard { background:#fff; border:1px solid #e5e7eb; border-radius:18px; padding:16px; margin-top:12px; }

.pgrid { display:grid; grid-template-columns:1fr 1fr; gap:12px 16px; }
.pfield { display:grid; gap:6px; }
.pfield--full { grid-column:1/-1; }

.plabel { font-size:13px; font-weight:900; color:#374151; }

.pinput,.ptextarea { width:100%; border:1px solid #d1d5db; border-radius:12px; padding:10px 12px; outline:none; font-size:14px; background:#fff; }
.pinput--tight { padding:9px 10px; border-radius:10px; }
.pinput:focus,.ptextarea:focus { border-color:#2563eb; }
.ptextarea { resize:vertical; }

.pselectWrap { position:relative; }
.pselect { appearance:none; width:100%; border:1px solid #d1d5db; border-radius:12px; padding:10px 38px 10px 12px; outline:none; font-size:14px; background:#fff; cursor:pointer; }
.pselect:focus { border-color:#2563eb; }
.pselectIcon { position:absolute; right:12px; top:50%; transform:translateY(-50%); opacity:.7; pointer-events:none; }

.secHead { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:10px; }
.secHead__h { margin:0; font-weight:900; font-size:16px; color:#111827; }
.secHead__p { margin:4px 0 0; font-size:13px; color:#6b7280; }

.purityPill { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; font-weight:900; font-size:13px; border:1px solid #e5e7eb; background:#fff; color:#111827; white-space:nowrap; }
.purityPill__dot { width:10px; height:10px; border-radius:999px; background:#9ca3af; }
.purityPill--18 { border-color:#fde68a; background:#fffbeb; } .purityPill--18 .purityPill__dot { background:#f59e0b; }
.purityPill--24 { border-color:#c7d2fe; background:#eef2ff; } .purityPill--24 .purityPill__dot { background:#4f46e5; }
.purityPill--mix { border-color:#fecaca; background:#fff1f2; } .purityPill--mix .purityPill__dot { background:#ef4444; }
.purityPill--none { opacity:.9; }

.errBox { display:flex; gap:8px; align-items:center; background:#fff1f2; border:1px solid #fecdd3; color:#9f1239; padding:10px 12px; border-radius:12px; margin:10px 0 12px; font-size:13px; }
.errBox__icon { font-size:16px; }
.tinyErr { margin-top:6px; font-size:12px; font-weight:800; color:#b91c1c; }

.miniTable { border:1px solid #e5e7eb; border-radius:16px; overflow:visible; }
.miniTable__head,.miniTable__row { display:grid; grid-template-columns:1.3fr 1fr 1fr 120px; gap:0; align-items:start; }
.miniTable__head--wide,.miniTable__row--wide { grid-template-columns:1.4fr .6fr .7fr .7fr .9fr .9fr 120px; }

.miniTable__head { background:#f9fafb; border-bottom:1px solid #eef2f7; }
.miniTable__th,.miniTable__td { padding:12px; }
.miniTable__th { font-size:12px; font-weight:900; color:#374151; }
.miniTable__th--actions,.miniTable__td--actions { display:flex; justify-content:flex-end; }

.miniTable__row { background:#fff; border-bottom:1px solid #f1f5f9; }
.miniTable__row:last-child { border-bottom:none; }

/* buttons */
.btnAdd { border:none; background:#2563eb; color:#fff; border-radius:999px; padding:10px 14px; font-weight:900; cursor:pointer; font-size:13px; }
.btnDel { border:none; background:#fee2e2; color:#991b1b; border-radius:999px; padding:10px 14px; font-weight:900; cursor:pointer; font-size:13px; }
.btnAdd:hover { filter: brightness(0.95); }
.btnDel:hover { filter: brightness(0.97); }

.totals { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; margin-top:12px; }
.totals__box { border:1px solid #e5e7eb; border-radius:14px; background:#fff; padding:12px; }
.totals__label { font-size:12px; color:#6b7280; font-weight:900; }
.totals__value { margin-top:6px; font-size:16px; font-weight:900; color:#111827; }

.readPill { display:inline-flex; align-items:center; justify-content:center; min-height:38px; padding:0 12px; border-radius:999px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:900; color:#111827; width:100%; }
.readPill--muted { color:#374151; }

.combo__btn { width:100%; border:1px solid #d1d5db; background:#fff; border-radius:12px; padding:9px 10px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:10px; }
.combo__text { font-size:13px; font-weight:900; color:#111827; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; text-align:left; }
.combo__icon { opacity:.7; font-size:12px; }

.dd { position:absolute; left:0; right:0; border-radius:14px; border:1px solid #e5e7eb; background:#fff; box-shadow:0 18px 45px rgba(17,24,39,.12); overflow:hidden; }
.dd--up { bottom:calc(100% + 8px); }

.dd__search { display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid #eef2f7; background:#fafafa; }
.dd__searchIcon { opacity:.6; }
.dd__searchInput { width:100%; border:1px solid #e5e7eb; border-radius:999px; padding:8px 10px; outline:none; font-size:14px; background:#fff; }
.dd__searchInput:focus { border-color:#2563eb; }

.dd__list { max-height:240px; overflow:auto; padding:6px; }
.dd__item { width:100%; text-align:left; border:none; background:transparent; cursor:pointer; padding:10px 10px; border-radius:12px; }
.dd__item:hover { background:#eef2ff; }
.dd__main { font-weight:900; color:#111827; font-size:14px; }
.dd__sub { font-size:12px; color:#6b7280; margin-top:2px; }
.dd__empty { padding:14px 10px; color:#6b7280; font-size:13px; }

.saveBar { margin-top:14px; background:#fff; border:1px solid #e5e7eb; border-radius:18px; padding:14px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.saveBar__right { display:flex; gap:10px; }
.btnGhost { border:none; border-radius:999px; padding:10px 16px; font-weight:900; cursor:pointer; font-size:14px; background:#f3f4f6; color:#111827; }
.btnPrimary { border:none; border-radius:999px; padding:10px 16px; font-weight:900; cursor:pointer; font-size:14px; background:#f59e0b; color:#111827; }

@media (max-width:980px) {
  .pgrid { grid-template-columns:1fr; }
  .miniTable__head,.miniTable__row { grid-template-columns:1fr; }
  .miniTable__head--wide,.miniTable__row--wide { grid-template-columns:1fr; }

  /* ✅ keep actions on the right even on mobile */
  .miniTable__th--actions,.miniTable__td--actions { justify-content:flex-end; }

  .totals { grid-template-columns:1fr; }
}
</style>
