<template>
  <div class="pwrap" @click="closeAllDd">
    <!-- header -->
    <div class="phead">
      <button class="phead__back" type="button" @click="goBack">← Back to products</button>
    </div>

    <div class="ptitle">
      <h2 class="ptitle__h">{{ isEdit ? 'Edit product' : 'Add product' }}</h2>
      <p class="ptitle__p">
        Create product + add gold sources + add jewellery sources (mock now, DB later).
      </p>
    </div>

    <!-- MAIN PRODUCT CARD -->
    <div class="pcard">
      <div class="pgrid">
        <div class="pfield">
          <label class="plabel">Name *</label>
          <input
            v-model="product.name"
            class="pinput"
            type="text"
            placeholder="e.g. Gold Ring 18K"
          />
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
          <input
            v-model.number="product.qty"
            class="pinput"
            type="number"
            min="0"
            placeholder="e.g. 10"
          />
        </div>

        <!-- ✅ NEW: Collection -->
        <div class="pfield">
          <label class="plabel">Collection</label>
          <input
            v-model="product.collection"
            class="pinput"
            type="text"
            placeholder="e.g. Classic"
          />
        </div>

        <!-- ✅ NEW: Color -->
        <div class="pfield">
          <label class="plabel">Color</label>
          <input
            v-model="product.color"
            class="pinput"
            type="text"
            placeholder="e.g. Yellow Gold"
          />
        </div>

        <!-- ✅ NEW: Weight -->
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

        <!-- ✅ NEW: Metarial Loss -->
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

        <!-- ✅ NEW: Making Cost -->
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

        <!-- ✅ NEW: Color Count -->
        <div class="pfield">
          <label class="plabel">Color Count</label>
          <input
            v-model.number="product.colorCount"
            class="pinput"
            type="number"
            min="0"
            placeholder="e.g. 2"
          />
        </div>

        <!-- ✅ NEW: Depreciation -->
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

        <!-- ✅ NEW: Product Type ID -->
        <div class="pfield">
          <label class="plabel">Product Type ID *</label>
          <input
            v-model.number="product.productTypeId"
            class="pinput"
            type="number"
            min="1"
            placeholder="e.g. 1"
          />
        </div>

        <div class="pfield pfield--full">
          <label class="plabel">Short Desc</label>
          <input
            v-model="product.shortDesc"
            class="pinput"
            type="text"
            placeholder="e.g. 18K ring with clean design"
          />
        </div>

        <div class="pfield pfield--full">
          <label class="plabel">Desc (varchar300)</label>
          <textarea
            v-model="product.desc"
            class="ptextarea"
            rows="3"
            placeholder="Write product description..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- ADD GOLD FOR PRODUCT -->
    <div class="pcard">
      <div class="secHead">
        <div>
          <h3 class="secHead__h">Add Gold For Product</h3>
          <p class="secHead__p">
            Choose purchased gold package (Gold Source), enter used weight + current price.
          </p>
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
        <div class="miniTable__head">
          <div class="miniTable__th">Gold Source *</div>
          <div class="miniTable__th">Weight Used (kyat/g) *</div>
          <div class="miniTable__th">Current Price (MMK) *</div>
          <div class="miniTable__th miniTable__th--actions">
            <button class="btnAdd" type="button" @click.stop="addGoldRow">+ Add</button>
          </div>
        </div>

        <div v-for="(row, idx) in goldRows" :key="row.key" class="miniTable__row">
          <div class="miniTable__td">
            <div class="combo" @click.stop>
              <button class="combo__btn" type="button" @click="toggleGoldDd(idx)">
                <span class="combo__text">{{ row.sourceLabel || 'Select gold package' }}</span>
                <span class="combo__icon">▾</span>
              </button>

              <div v-if="row.ddOpen" class="dd">
                <div class="dd__search">
                  <span class="dd__searchIcon">🔍</span>
                  <input
                    v-model="row.query"
                    class="dd__searchInput"
                    type="text"
                    placeholder="Search package id / merchant..."
                  />
                </div>

                <div class="dd__list">
                  <button
                    v-for="g in filteredGoldPackages(row.query)"
                    :key="g.id"
                    class="dd__item"
                    type="button"
                    @click="selectGoldPackage(idx, g)"
                  >
                    <div class="dd__main">{{ g.packageId }}</div>
                    <div class="dd__sub">
                      {{ g.merchantName }} • Available: {{ g.availableWeight }} • Purity:
                      {{ g.purity }}
                    </div>
                  </button>

                  <div v-if="filteredGoldPackages(row.query).length === 0" class="dd__empty">
                    No gold packages found
                  </div>
                </div>
              </div>
            </div>
          </div>

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
            <button class="btnDel" type="button" @click="removeGoldRow(idx)">Delete</button>
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
      </div>
    </div>

    <!-- ADD JEWELLERY FOR PRODUCT -->
    <div class="pcard">
      <div class="secHead">
        <div>
          <h3 class="secHead__h">Add Jewellery For Product</h3>
          <p class="secHead__p">
            Choose jewellery source, enter qty + selling price. Original price comes from DB.
          </p>
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

        <div
          v-for="(row, idx) in jewelryRows"
          :key="row.key"
          class="miniTable__row miniTable__row--wide"
        >
          <div class="miniTable__td">
            <div class="combo" @click.stop>
              <button class="combo__btn" type="button" @click="toggleJewelryDd(idx)">
                <span class="combo__text">{{ row.sourceLabel || 'Select jewellery package' }}</span>
                <span class="combo__icon">▾</span>
              </button>

              <div v-if="row.ddOpen" class="dd">
                <div class="dd__search">
                  <span class="dd__searchIcon">🔍</span>
                  <input
                    v-model="row.query"
                    class="dd__searchInput"
                    type="text"
                    placeholder="Search package id / type..."
                  />
                </div>

                <div class="dd__list">
                  <button
                    v-for="j in filteredJewelryPackages(row.query)"
                    :key="j.id"
                    class="dd__item"
                    type="button"
                    @click="selectJewelryPackage(idx, j)"
                  >
                    <div class="dd__main">{{ j.packageId }}</div>
                    <div class="dd__sub">
                      {{ j.type }} • Available Qty: {{ j.availableQty }} • Unit Wt:
                      {{ j.unitWeight }} • Original:
                      {{ j.originalPrice.toLocaleString() }}
                    </div>
                  </button>

                  <div v-if="filteredJewelryPackages(row.query).length === 0" class="dd__empty">
                    No jewellery packages found
                  </div>
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
            <div class="readPill">{{ (row.unitWeight * row.qty).toFixed(2) }}</div>
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
            <div class="readPill readPill--muted">
              {{ row.originalPrice ? row.originalPrice.toLocaleString() : '—' }}
            </div>
          </div>

          <div class="miniTable__td miniTable__td--actions">
            <button class="btnDel" type="button" @click="removeJewelryRow(idx)">Delete</button>
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
  import { computed, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const router = useRouter()
  const route = useRoute()
  const isEdit = computed(() => !!route.params.id)

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
  })

  // ----- MOCK DB LISTS (replace later with real API) -----
  type GoldPkg = {
    id: number
    packageId: string
    merchantName: string
    availableWeight: number
    purity: '18K' | '24K'
    currentPricePerUnit: number
  }

  const goldPackages: GoldPkg[] = [
    {
      id: 1,
      packageId: 'Pac 1101',
      merchantName: 'Gold Merchant A',
      availableWeight: 20,
      purity: '18K',
      currentPricePerUnit: 4000,
    },
    {
      id: 2,
      packageId: 'Pac 1102',
      merchantName: 'Gold Merchant A',
      availableWeight: 50,
      purity: '18K',
      currentPricePerUnit: 4000,
    },
    {
      id: 3,
      packageId: 'Pac 1103',
      merchantName: 'Gold Merchant B',
      availableWeight: 60,
      purity: '24K',
      currentPricePerUnit: 5200,
    },
    {
      id: 4,
      packageId: 'Pac 1104',
      merchantName: 'Gold Merchant C',
      availableWeight: 70,
      purity: '18K',
      currentPricePerUnit: 4100,
    },
  ]

  type JewelryPkg = {
    id: number
    packageId: string
    type: string
    availableQty: number
    unitWeight: number
    originalPrice: number
  }

  const jewelryPackages: JewelryPkg[] = [
    {
      id: 11,
      packageId: 'Pac J-103',
      type: 'Ring',
      availableQty: 50,
      unitWeight: 3.9,
      originalPrice: 290000,
    },
    {
      id: 12,
      packageId: 'Pac J-210',
      type: 'Necklace',
      availableQty: 30,
      unitWeight: 6.5,
      originalPrice: 480000,
    },
    {
      id: 13,
      packageId: 'Pac J-305',
      type: 'Bracelet',
      availableQty: 20,
      unitWeight: 4.2,
      originalPrice: 360000,
    },
  ]

  // ----- GOLD ROWS -----
  type GoldRow = {
    key: string
    ddOpen: boolean
    query: string
    goldPackageId: number | null
    sourceLabel: string
    purity: '18K' | '24K' | ''
    availableWeight: number
    weightUsed: number
    currentPrice: number
    weightError: string
    priceError: string
  }

  const goldRows = ref<GoldRow[]>([
    {
      key: crypto.randomUUID(),
      ddOpen: false,
      query: '',
      goldPackageId: null,
      sourceLabel: '',
      purity: '',
      availableWeight: 0,
      weightUsed: 0,
      currentPrice: 0,
      weightError: '',
      priceError: '',
    },
  ])

  const goldError = ref<string | null>(null)

  const totalGoldWeight = computed(() =>
    goldRows.value.reduce((sum, r) => sum + (Number(r.weightUsed) || 0), 0)
  )

  const totalGoldPrice = computed(() =>
    goldRows.value.reduce((sum, r) => sum + (Number(r.currentPrice) || 0), 0)
  )

  const goldPurityLabel = computed(() => {
    const purities = goldRows.value.map((r) => r.purity).filter((x) => !!x)
    if (purities.length === 0) return 'Purity: not set'
    const unique = Array.from(new Set(purities))
    if (unique.length === 1) return `Purity: ${unique[0]}`
    return 'Purity: MIXED'
  })

  const purityClass = computed(() => {
    if (goldPurityLabel.value.includes('18K')) return 'purityPill--18'
    if (goldPurityLabel.value.includes('24K')) return 'purityPill--24'
    if (goldPurityLabel.value.includes('MIXED')) return 'purityPill--mix'
    return 'purityPill--none'
  })

  const filteredGoldPackages = (q: string) => {
    const term = (q || '').trim().toLowerCase()
    if (!term) return goldPackages
    return goldPackages.filter(
      (g) =>
        g.packageId.toLowerCase().includes(term) ||
        g.merchantName.toLowerCase().includes(term) ||
        String(g.id).includes(term)
    )
  }

  const toggleGoldDd = (idx: number) => {
    goldRows.value = goldRows.value.map((r, i) => ({ ...r, ddOpen: i === idx ? !r.ddOpen : false }))
    jewelryRows.value = jewelryRows.value.map((r) => ({ ...r, ddOpen: false }))
  }

  const selectGoldPackage = (idx: number, g: GoldPkg) => {
    const row = goldRows.value[idx]
    row.goldPackageId = g.id
    row.sourceLabel = g.packageId
    row.purity = g.purity
    row.availableWeight = g.availableWeight
    if (!row.currentPrice || row.currentPrice === 0) row.currentPrice = g.currentPricePerUnit
    row.ddOpen = false
    row.query = ''
    validateGoldRows()
  }

  const addGoldRow = () => {
    goldRows.value.push({
      key: crypto.randomUUID(),
      ddOpen: false,
      query: '',
      goldPackageId: null,
      sourceLabel: '',
      purity: '',
      availableWeight: 0,
      weightUsed: 0,
      currentPrice: 0,
      weightError: '',
      priceError: '',
    })
    validateGoldRows()
  }

  const removeGoldRow = (idx: number) => {
    if (goldRows.value.length === 1) return
    goldRows.value.splice(idx, 1)
    validateGoldRows()
  }

  const validateGoldRows = () => {
    goldError.value = null
    let hasAnyError = false

    goldRows.value.forEach((r) => {
      r.weightError = ''
      r.priceError = ''

      if (r.goldPackageId) {
        if ((r.weightUsed ?? 0) <= 0) {
          r.weightError = 'Weight is required.'
          hasAnyError = true
        } else if (r.weightUsed > r.availableWeight) {
          r.weightError = `Exceeds available weight (${r.availableWeight}).`
          hasAnyError = true
        }

        if ((r.currentPrice ?? 0) <= 0) {
          r.priceError = 'Current price is required.'
          hasAnyError = true
        }
      }
    })

    if (hasAnyError) goldError.value = 'Please fix errors in Gold rows (weight/price mismatch).'
  }

  // ----- JEWELLERY ROWS -----
  type JewelryRow = {
    key: string
    ddOpen: boolean
    query: string
    jewelryPackageId: number | null
    sourceLabel: string
    availableQty: number
    unitWeight: number
    originalPrice: number
    qty: number
    sellingPrice: number
    qtyError: string
    sellError: string
  }

  const jewelryRows = ref<JewelryRow[]>([
    {
      key: crypto.randomUUID(),
      ddOpen: false,
      query: '',
      jewelryPackageId: null,
      sourceLabel: '',
      availableQty: 0,
      unitWeight: 0,
      originalPrice: 0,
      qty: 0,
      sellingPrice: 0,
      qtyError: '',
      sellError: '',
    },
  ])

  const jewelryError = ref<string | null>(null)

  const filteredJewelryPackages = (q: string) => {
    const term = (q || '').trim().toLowerCase()
    if (!term) return jewelryPackages
    return jewelryPackages.filter(
      (j) =>
        j.packageId.toLowerCase().includes(term) ||
        j.type.toLowerCase().includes(term) ||
        String(j.id).includes(term)
    )
  }

  const toggleJewelryDd = (idx: number) => {
    jewelryRows.value = jewelryRows.value.map((r, i) => ({
      ...r,
      ddOpen: i === idx ? !r.ddOpen : false,
    }))
    goldRows.value = goldRows.value.map((r) => ({ ...r, ddOpen: false }))
  }

  const selectJewelryPackage = (idx: number, j: JewelryPkg) => {
    const row = jewelryRows.value[idx]
    row.jewelryPackageId = j.id
    row.sourceLabel = j.packageId
    row.availableQty = j.availableQty
    row.unitWeight = j.unitWeight
    row.originalPrice = j.originalPrice
    row.ddOpen = false
    row.query = ''
    validateJewelryRows()
  }

  const addJewelryRow = () => {
    jewelryRows.value.push({
      key: crypto.randomUUID(),
      ddOpen: false,
      query: '',
      jewelryPackageId: null,
      sourceLabel: '',
      availableQty: 0,
      unitWeight: 0,
      originalPrice: 0,
      qty: 0,
      sellingPrice: 0,
      qtyError: '',
      sellError: '',
    })
    validateJewelryRows()
  }

  const removeJewelryRow = (idx: number) => {
    if (jewelryRows.value.length === 1) return
    jewelryRows.value.splice(idx, 1)
    validateJewelryRows()
  }

  const validateJewelryRows = () => {
    jewelryError.value = null
    let hasAnyError = false

    jewelryRows.value.forEach((r) => {
      r.qtyError = ''
      r.sellError = ''

      if (r.jewelryPackageId) {
        if ((r.qty ?? 0) <= 0) {
          r.qtyError = 'Qty is required.'
          hasAnyError = true
        } else if (r.qty > r.availableQty) {
          r.qtyError = `Exceeds available qty (${r.availableQty}).`
          hasAnyError = true
        }

        if ((r.sellingPrice ?? 0) <= 0) {
          r.sellError = 'Selling price is required.'
          hasAnyError = true
        }
      }
    })

    if (hasAnyError)
      jewelryError.value = 'Please fix errors in Jewellery rows (qty/price mismatch).'
  }

  const totalJewelryQty = computed(() =>
    jewelryRows.value.reduce((sum, r) => sum + (Number(r.qty) || 0), 0)
  )

  const totalJewelryWeight = computed(() =>
    jewelryRows.value.reduce(
      (sum, r) => sum + (Number(r.qty) || 0) * (Number(r.unitWeight) || 0),
      0
    )
  )

  const totalSellingPrice = computed(() =>
    jewelryRows.value.reduce((sum, r) => sum + (Number(r.sellingPrice) || 0), 0)
  )

  const closeAllDd = () => {
    goldRows.value = goldRows.value.map((r) => ({ ...r, ddOpen: false }))
    jewelryRows.value = jewelryRows.value.map((r) => ({ ...r, ddOpen: false }))
  }

  const goBack = () => router.push('/admin/products')

  const onSaveAll = () => {
    if (!String(product.name || '').trim()) {
      alert('Product name is required.')
      return
    }
    if (!product.productTypeId || Number(product.productTypeId) <= 0) {
      alert('Product Type ID is required.')
      return
    }
    if (product.depreciation == null || Number(product.depreciation) <= 0) {
      alert('Depreciation is required.')
      return
    }

    validateGoldRows()
    validateJewelryRows()

    const goldMissing = goldRows.value.some((r) => !r.goldPackageId)
    const jewMissing = jewelryRows.value.some((r) => !r.jewelryPackageId)

    if (goldMissing) {
      goldError.value = 'Please choose Gold Source for every row.'
      return
    }
    if (jewMissing) {
      jewelryError.value = 'Please choose Jewellery Source for every row.'
      return
    }
    if (goldError.value || jewelryError.value) return

    const payload = {
      product: { ...product },
      goldForProduct: goldRows.value.map((r) => ({
        goldPackageId: r.goldPackageId,
        weightUsed: r.weightUsed,
        currentPrice: r.currentPrice,
        purity: r.purity,
      })),
      jewelleryForProduct: jewelryRows.value.map((r) => ({
        jewelryPackageId: r.jewelryPackageId,
        qty: r.qty,
        unitWeight: r.unitWeight,
        totalWeight: r.unitWeight * r.qty,
        sellingPrice: r.sellingPrice,
        originalPrice: r.originalPrice,
      })),
    }

    console.log('SAVE payload (mock):', payload)
    alert('Saved (mock). Check console payload.')
    goBack()
  }
</script>

<style scoped>
  .pwrap {
    background: #f3f4f6;
    min-height: 100vh;
    padding: 18px 18px 30px;
  }

  .phead {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 14px;
  }

  .phead__back {
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 900;
    color: #2563eb;
  }

  .ptitle {
    margin: 12px 2px 14px;
  }

  .ptitle__h {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
  }

  .ptitle__p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  .pcard {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px;
    margin-top: 12px;
  }

  .pgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }

  .pfield {
    display: grid;
    gap: 6px;
  }

  .pfield--full {
    grid-column: 1 / -1;
  }

  .plabel {
    font-size: 13px;
    font-weight: 900;
    color: #374151;
  }

  .pinput,
  .ptextarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
  }

  .pinput--tight {
    padding: 9px 10px;
    border-radius: 10px;
  }

  .pinput:focus,
  .ptextarea:focus {
    border-color: #2563eb;
  }

  .ptextarea {
    resize: vertical;
  }

  .pselectWrap {
    position: relative;
  }

  .pselect {
    appearance: none;
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 10px 38px 10px 12px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
    cursor: pointer;
  }

  .pselect:focus {
    border-color: #2563eb;
  }

  .pselectIcon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.7;
    pointer-events: none;
  }

  .secHead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 10px;
  }

  .secHead__h {
    margin: 0;
    font-weight: 900;
    font-size: 16px;
    color: #111827;
  }

  .secHead__p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  /* purity pill */
  .purityPill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 13px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    white-space: nowrap;
  }

  .purityPill__dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #9ca3af;
  }

  .purityPill--18 {
    border-color: #fde68a;
    background: #fffbeb;
  }
  .purityPill--18 .purityPill__dot {
    background: #f59e0b;
  }

  .purityPill--24 {
    border-color: #c7d2fe;
    background: #eef2ff;
  }
  .purityPill--24 .purityPill__dot {
    background: #4f46e5;
  }

  .purityPill--mix {
    border-color: #fecaca;
    background: #fff1f2;
  }
  .purityPill--mix .purityPill__dot {
    background: #ef4444;
  }

  .purityPill--none {
    opacity: 0.9;
  }

  /* error box */
  .errBox {
    display: flex;
    gap: 8px;
    align-items: center;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
    padding: 10px 12px;
    border-radius: 12px;
    margin: 10px 0 12px;
    font-size: 13px;
  }

  .errBox__icon {
    font-size: 16px;
  }

  .tinyErr {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 800;
    color: #b91c1c;
  }

  /* mini table */
  .miniTable {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow: hidden;
  }

  .miniTable__head,
  .miniTable__row {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr 120px;
    gap: 0;
    align-items: start;
  }

  .miniTable__head--wide,
  .miniTable__row--wide {
    grid-template-columns: 1.4fr 0.6fr 0.7fr 0.7fr 0.9fr 0.9fr 120px;
  }

  .miniTable__head {
    background: #f9fafb;
    border-bottom: 1px solid #eef2f7;
  }

  .miniTable__th,
  .miniTable__td {
    padding: 12px;
  }

  .miniTable__th {
    font-size: 12px;
    font-weight: 900;
    color: #374151;
  }

  .miniTable__th--actions,
  .miniTable__td--actions {
    display: flex;
    justify-content: flex-end;
  }

  .miniTable__row {
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
  }

  .miniTable__row:last-child {
    border-bottom: none;
  }

  .btnAdd {
    border: none;
    background: #2563eb;
    color: #ffffff;
    border-radius: 999px;
    padding: 8px 12px;
    font-weight: 900;
    cursor: pointer;
    font-size: 13px;
  }

  .btnDel {
    border: none;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 999px;
    padding: 8px 12px;
    font-weight: 900;
    cursor: pointer;
    font-size: 13px;
  }

  /* totals */
  .totals {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .totals__box {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    padding: 12px;
  }

  .totals__label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 900;
  }

  .totals__value {
    margin-top: 6px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  /* readonly pill */
  .readPill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    font-weight: 900;
    color: #111827;
    width: 100%;
  }

  .readPill--muted {
    color: #374151;
  }

  /* searchable dropdown */
  .combo {
    position: relative;
  }

  .combo__btn {
    width: 100%;
    border: 1px solid #d1d5db;
    background: #ffffff;
    border-radius: 12px;
    padding: 9px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .combo__text {
    font-size: 13px;
    font-weight: 900;
    color: #111827;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
  }

  .combo__icon {
    opacity: 0.7;
    font-size: 12px;
  }

  .dd {
    position: absolute;
    z-index: 60;
    left: 0;
    right: 0;
    margin-top: 8px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 18px 45px rgba(17, 24, 39, 0.12);
    overflow: hidden;
  }

  .dd__search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #eef2f7;
    background: #fafafa;
  }

  .dd__searchIcon {
    opacity: 0.6;
  }

  .dd__searchInput {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    padding: 8px 10px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
  }

  .dd__searchInput:focus {
    border-color: #2563eb;
  }

  .dd__list {
    max-height: 240px;
    overflow: auto;
    padding: 6px;
  }

  .dd__item {
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 10px 10px;
    border-radius: 12px;
  }

  .dd__item:hover {
    background: #eef2ff;
  }

  .dd__main {
    font-weight: 900;
    color: #111827;
    font-size: 14px;
  }

  .dd__sub {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }

  .dd__empty {
    padding: 14px 10px;
    color: #6b7280;
    font-size: 13px;
  }

  /* save bar */
  .saveBar {
    margin-top: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .saveBar__hint {
    color: #6b7280;
    font-size: 13px;
    font-weight: 800;
  }

  .saveBar__right {
    display: flex;
    gap: 10px;
  }

  .btnGhost {
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 900;
    cursor: pointer;
    font-size: 14px;
    background: #f3f4f6;
    color: #111827;
  }

  .btnPrimary {
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 900;
    cursor: pointer;
    font-size: 14px;
    background: #f59e0b;
    color: #111827;
  }

  @media (max-width: 980px) {
    .pgrid {
      grid-template-columns: 1fr;
    }
    .miniTable__head,
    .miniTable__row {
      grid-template-columns: 1fr;
    }
    .miniTable__head--wide,
    .miniTable__row--wide {
      grid-template-columns: 1fr;
    }
    .miniTable__th--actions,
    .miniTable__td--actions {
      justify-content: flex-start;
    }
    .totals {
      grid-template-columns: 1fr;
    }
  }
</style>
