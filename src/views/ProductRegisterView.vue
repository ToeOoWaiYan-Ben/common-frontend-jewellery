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

        <div class="pfield">
          <label class="plabel">Collection</label>
          <input
            v-model="product.collection"
            class="pinput"
            type="text"
            placeholder="e.g. Classic"
          />
        </div>

        <div class="pfield">
          <label class="plabel">Color</label>
          <input
            v-model="product.color"
            class="pinput"
            type="text"
            placeholder="e.g. Yellow Gold"
          />
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
          <input
            v-model.number="product.colorCount"
            class="pinput"
            type="number"
            min="0"
            placeholder="e.g. 2"
          />
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

        <!-- ✅ Product Type dropdown search (JewelryType) -->
        <div class="pfield">
          <label class="plabel">Product Type (Jewelry Type) *</label>

          <div class="combo" @click.stop>
            <button class="combo__btn" type="button" @click.stop="toggleTypeDd">
              <span class="combo__text">{{ selectedTypeLabel || 'Select jewelry type' }}</span>
              <span class="combo__icon">▾</span>
            </button>

            <div v-if="typeDdOpen" class="dd dd--up" @click.stop>
              <div class="dd__search">
                <span class="dd__searchIcon">🔍</span>
                <input
                  v-model="typeQuery"
                  class="dd__searchInput"
                  type="text"
                  placeholder="Search type name / category / id..."
                />
              </div>

              <div class="dd__list">
                <button
                  v-for="t in filteredJewelryTypes(typeQuery)"
                  :key="t.id"
                  class="dd__item"
                  type="button"
                  @click.stop="selectType(t)"
                >
                  <div class="dd__main">{{ t.name }}</div>
                  <div class="dd__sub">Category: {{ t.categoryName ?? '-' }} • ID: {{ t.id }}</div>
                </button>

                <div v-if="filteredJewelryTypes(typeQuery).length === 0" class="dd__empty">
                  No jewelry types found
                </div>
              </div>
            </div>
          </div>
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
        <!-- Product Images -->
        <!-- PRODUCT IMAGES (GRID LIKE YOUR SCREENSHOT) -->
        <div class="pfield pfield--full">
  <label class="plabel">Product Images</label>

  <div class="media-grid">
    <!-- DB images -->
    <div v-for="img in productImages" :key="'db-' + img.id" class="media-card">
      <img :src="img.imageUrl" class="media-img" />
      <button class="media-x" type="button" @click.stop="deleteDbImage(img.id)">×</button>
    </div>

    <!-- preview images -->
    <div v-for="p in selectedPreviews" :key="'pv-' + p.key" class="media-card">
      <img :src="p.previewUrl" class="media-img" />
      <button class="media-x" type="button" @click.stop="removePreview(p.key)">×</button>
    </div>

    <!-- empty slots -->
    <button
      v-for="n in emptySlots"
      :key="'slot-' + n"
      type="button"
      class="media-slot"
      @click.stop="triggerFilePicker"
      :disabled="totalCount >= MAX_PHOTOS"
    >
      <div class="media-plus">+</div>
    </button>

    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display:none"
      @change="onImgFilesSelected"
    />
  </div>
</div>
      </div>
    </div>

    <!-- ADD GOLD FOR PRODUCT -->
    <div class="pcard">
      <div class="secHead">
        <div>
          <h3 class="secHead__h">Add Gold For Product</h3>
          <p class="secHead__p">
            Choose purchased gold package (Gold Source) + craft, enter used weight + current price.
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
        <div class="miniTable__head miniTable__head--gold">
          <div class="miniTable__th">Gold Source *</div>
          <div class="miniTable__th">Craft *</div>
          <div class="miniTable__th">Weight Used (kyat/g) *</div>
          <div class="miniTable__th">Current Price (MMK) *</div>
          <div class="miniTable__th miniTable__th--actions">
            <button class="btnAdd" type="button" @click.stop="addGoldRow">+ Add</button>
          </div>
        </div>

        <div
          v-for="(row, idx) in product.goldRows"
          :key="row.key"
          class="miniTable__row miniTable__row--gold"
        >
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
                  <input
                    v-model="row.query"
                    class="dd__searchInput"
                    type="text"
                    placeholder="Search package id / merchant..."
                  />
                </div>

                <div class="dd__list">
                  <button
                    v-for="g in filteredGoldSources(row.query)"
                    :key="g.id"
                    class="dd__item"
                    type="button"
                    :disabled="Number(g.remainingWeight ?? g.weight ?? 0) <= 0"
                    @click.stop="
                      Number(g.remainingWeight ?? g.weight ?? 0) > 0 && selectGoldSource(idx, g)
                    "
                  >
                    <div class="dd__main">{{ g.name }}</div>

                    <div class="dd__sub">
                      {{ g.sourceCountry || '-' }} • Remaining:
                      {{ Number(g.remainingWeight ?? g.weight ?? 0).toFixed(2) }} • Purity:
                      {{ g.goldPurity || '-' }}
                    </div>
                  </button>

                  <div v-if="filteredGoldSources(row.query).length === 0" class="dd__empty">
                    No gold packages found
                  </div>
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
                  <input
                    v-model="row.craftQuery"
                    class="dd__searchInput"
                    type="text"
                    placeholder="Search shop name / NRC / phone..."
                  />
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

                  <div v-if="filteredCrafts(row.craftQuery).length === 0" class="dd__empty">
                    No crafts found
                  </div>
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
            <div
              v-if="row.goldSourceId"
              class="remainLine"
              :class="{ 'remainLine--bad': !!row.weightError }"
            >
              Remaining: {{ remainingAfterThisRow(idx).toFixed(2) }}
            </div>

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
          <div class="totals__label"></div>
          <div class="totals__value"></div>
        </div>
      </div>
    </div>

    <!-- ADD JEWELLERY FOR PRODUCT -->
    <div class="pcard">
      <div class="secHead">
        <div>
          <h3 class="secHead__h">Add Jewellery For Product</h3>
          <p class="secHead__p">
            Choose jewellery source, enter qty + selling price. Unit price comes from gem package.
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
          v-for="(row, idx) in product.jewelryRows"
          :key="row.key"
          class="miniTable__row miniTable__row--wide"
        >
          <div class="miniTable__td">
            <div class="combo" @click.stop>
              <button class="combo__btn" type="button" @click.stop="toggleJewelryDd(idx)">
                <span class="combo__text">{{ row.sourceLabel || 'Select jewellery package' }}</span>
                <span class="combo__icon">▾</span>
              </button>

              <div v-if="row.ddOpen" class="dd dd--up" @click.stop>
                <div class="dd__search">
                  <span class="dd__searchIcon">🔍</span>
                  <input
                    v-model="row.query"
                    class="dd__searchInput"
                    type="text"
                    placeholder="Search package name / gem type..."
                  />
                </div>

                <div class="dd__list">
                  <button
  v-for="p in filteredGemPackages(row.query)"
  :key="p.id"
  class="dd__item"
  type="button"
  :disabled="Number(p.remainingQty ?? p.quantity ?? 0) <= 0"
  @click.stop="Number(p.remainingQty ?? p.quantity ?? 0) > 0 && selectJewelryPackage(idx, p)"
>
                    <div class="dd__main">{{ p.name }}</div>
                    <div class="dd__sub">
  {{ p.gemTypeName || '-' }} • Available Qty:
  {{ Number(p.remainingQty ?? p.quantity ?? 0) }} •
  Unit Wt: {{ Number(p.gemsSize ?? 0).toFixed(4) }} • Unit Price:
  {{ unitPriceFromPackage(p).toLocaleString() }}
</div>
                  </button>

                  <div v-if="filteredGemPackages(row.query).length === 0" class="dd__empty">
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
            <div
  v-if="row.gemsPackageId"
  class="remainLine"
  :class="{ 'remainLine--bad': !!row.qtyError }"
>
Remaining: {{ remainingAfterThisJewelryRow(idx) }}
</div>
<div v-if="row.qtyError" class="tinyErr">{{ row.qtyError }}</div>
          </div>

          <div class="miniTable__td">
            <div class="readPill">{{ row.unitWeight || 0 }}</div>
          </div>

          <div class="miniTable__td">
            <div class="readPill">
              {{ (Number(row.unitWeight || 0) * Number(row.qty || 0)).toFixed(2) }}
            </div>
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
  import type { JewelryTypeDto } from '../dtos/JewelryTypeDto'
  import { useProductsStore } from '../stores/useProductsStore'

  const fillProduct = (p: any) => {
    product.id = Number(p.id ?? 0)
    product.name = p.name ?? ''
    product.code = p.code ?? ''
    product.stockStatus = p.stockStatus ?? ''
    product.desc = p.desc ?? ''
    product.qty = Number(p.qty ?? 0)
    product.collection = p.collection ?? ''
    product.shortDesc = p.shortDesc ?? ''
    product.color = p.color ?? ''
    product.weight = Number(p.weight ?? 0)
    product.metarialLoss = Number(p.metarialLoss ?? 0)
    product.makingCost = Number(p.makingCost ?? 0)
    product.colorCount = Number(p.colorCount ?? 0)
    product.depreciation = Number(p.depreciation ?? 0)
    product.productTypeId = p.productTypeId != null ? Number(p.productTypeId) : null
  }


    type PreviewImg = { key: string; file: File; previewUrl: string }
    const selectedPreviews = ref<PreviewImg[]>([])
      const totalCount = computed(() => productImages.value.length + selectedPreviews.value.length)


      function onImgFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (!files.length) return

  const available = MAX_PHOTOS - totalCount.value
  const picked = files.slice(0, Math.max(0, available))

  for (const f of picked) {
    imgFiles.value.push(f) // ✅ important for upload

    selectedPreviews.value.push({
      key: crypto.randomUUID(),
      file: f,
      previewUrl: URL.createObjectURL(f),
    })
  }

  input.value = ''
}
  const MAX_PHOTOS = 9
  const fileInput = ref<HTMLInputElement | null>(null)

  const productImages = ref<any[]>([])
    const imgFiles = ref<File[]>([])
    function removePreview(key: string) {
  const idx = selectedPreviews.value.findIndex((x) => x.key === key)
  if (idx === -1) return

  const item = selectedPreviews.value[idx]
  URL.revokeObjectURL(item.previewUrl)

  const fileIdx = imgFiles.value.findIndex((f) => f === item.file)
  if (fileIdx !== -1) imgFiles.value.splice(fileIdx, 1)

  selectedPreviews.value.splice(idx, 1)
}
async function deleteDbImage(imageId: number) {
  if (!isEdit.value) return
  const pid = Number(route.params.id)

  await productsStore.deleteProductImage(imageId, pid)
  productImages.value = productImages.value.filter((x) => x.id !== imageId)
}

  const router = useRouter()
  const route = useRoute()
  const isEdit = computed(() => !!route.params.id)

  const productsStore = useProductsStore()
  const emptySlots = computed(() => {
    const left = MAX_PHOTOS - totalCount.value
    return left > 0 ? Array.from({ length: left }, (_, i) => i + 1) : []
  })

  function triggerFilePicker() {
    fileInput.value?.click()
  }
  async function deleteProductImage(imageId: number) {
    if (!isEdit.value) return
    const pid = Number(route.params.id)
    await productsStore.deleteProductImage(imageId, pid)
    productImages.value = (productImages.value ?? []).filter((x) => x.id !== imageId)
  }

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

  // DB lists
  const goldSources = ref<GoldSourceDto[]>([])
  const gemsPackages = ref<GemsPackageDto[]>([])
  const crafts = ref<CraftDto[]>([])
  const jewelryTypes = ref<JewelryTypeDto[]>([])

  // ✅ ProductType dropdown state
  const typeDdOpen = ref(false)
  const typeQuery = ref('')

  onMounted(async () => {
    // load dropdown lists first
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
    try {
      jewelryTypes.value = (await http<JewelryTypeDto[]>('/jewelry-types')) ?? []
    } catch {
      jewelryTypes.value = []
    }

    // ✅ if edit, load product detail
    if (isEdit.value) {
      const productId = Number(route.params.id)
      if (!productId) return alert('Invalid product id in url.')

      try {
        const p = await http<any>(`/products/${productId}`)
        if (!p) return alert('Product not found.')

        fillProduct(p)

        // ✅ set images here (NOT inside map)
        productImages.value = p.productImages ?? []

        if (Array.isArray(p.productGolds)) {
          product.goldRows = p.productGolds.map((g: any) => ({
            key: crypto.randomUUID(),
            ddOpen: false,
            query: '',
            goldSourceId: Number(g.goldSourceId ?? g.goldSource?.id ?? 0) || null,
            sourceLabel: g.goldSourceName ?? g.goldSource?.name ?? '',
            purity: g.goldPurity ? String(g.goldPurity) : '',
            availableWeight: 0,
            weightUsed: Number(g.weight ?? 0),
            currentPrice: Number(g.currentPrice ?? 0),
            weightError: '',
            priceError: '',
            craftDdOpen: false,
            craftQuery: '',
            craftId: Number(g.craftId ?? g.craft?.id ?? 0) || null,
            craftLabel: g.craftShopName ?? g.craft?.shopName ?? '',
            craftError: '',
          }))
        }

        if (Array.isArray(p.productJewellerys)) {
          product.jewelryRows = p.productJewellerys.map((j: any) => ({
            key: crypto.randomUUID(),
            ddOpen: false,
            query: '',
            gemsPackageId: Number(j.gemsPackageId ?? j.gemsPackage?.id ?? 0) || null,
            sourceLabel: j.gemsPackageName ?? j.gemsPackage?.name ?? '',
            availableQty: 0,
            unitWeight: Number(j.unitWeight ?? j.gemsSize ?? 0),
            unitPrice: Number(j.unitPrice ?? 0),
            qty: Number(j.qty ?? 0),
            sellingPrice: Number(j.sellingPrice ?? 0),
            qtyError: '',
            sellError: '',
          }))
        }
      } catch (e: any) {
        alert(e?.message ?? 'Failed to load product detail.')
      }
    }
  })

  // -------- helpers --------
  const unitPriceFromPackage = (p: any) => {
    const direct = Number(p.unitPrice ?? p.unit_price ?? p.pricePerUnit ?? p.unit_price_mmk ?? NaN)
    if (!Number.isNaN(direct)) return direct

    const total = Number(p.originalPrice ?? p.original_price ?? 0)
    const qty = Number(p.quantity ?? 0)
    if (qty > 0) return Math.round(total / qty)

    return 0
  }

  // ✅ IMPORTANT: backend expects Float -> send number (18/24)
  const parsePurityToNumber = (v: any): number => {
    const m = String(v ?? '').match(/(\d+(\.\d+)?)/) // "18 K" -> 18
    return m ? Number(m[1]) : 0
  }

  // ----- ProductType dropdown helpers -----
  const filteredJewelryTypes = (q: string) => {
    const term = (q || '').trim().toLowerCase()
    if (!term) return jewelryTypes.value
    return jewelryTypes.value.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(term) ||
        (t.categoryName || '').toLowerCase().includes(term) ||
        String(t.id).includes(term)
    )
  }

  const selectedTypeLabel = computed(() => {
    if (!product.productTypeId) return ''
    const t = jewelryTypes.value.find((x) => x.id === product.productTypeId)
    if (!t) return `Selected ID: ${product.productTypeId}`
    return t.categoryName ? `${t.name} (${t.categoryName})` : t.name
  })

  const toggleTypeDd = () => {
    typeDdOpen.value = !typeDdOpen.value

    // close other dropdowns
    product.goldRows.forEach((r) => (r.ddOpen = false))
    product.goldRows.forEach((r) => (r.craftDdOpen = false))
    product.jewelryRows.forEach((r) => (r.ddOpen = false))
  }

  const selectType = (t: JewelryTypeDto) => {
    product.productTypeId = t.id
    typeDdOpen.value = false
    typeQuery.value = ''
  }
  //-----package ---
  const allowanceQtyForRow = (rowIndex: number): number => {
  const row = product.jewelryRows[rowIndex]
  if (!row.gemsPackageId) return 0

  const pkg = gemsPackages.value.find(
    (x: any) => x.id === row.gemsPackageId
  ) as any

  const total = Number(pkg?.remainingQty ?? pkg?.quantity ?? 0)

  const usedJewels = product.jewelryRows.reduce((sum, r, i) => {
    if (i === rowIndex) return sum
    if (r.gemsPackageId !== row.gemsPackageId) return sum
    return sum + (Number(r.qty) || 0)
  }, 0)

  return Math.max(0, total - usedJewels)
}
const remainingAfterThisJewelryRow = (rowIndex: number): number => {
  const row = product.jewelryRows[rowIndex]
  if (!row.gemsPackageId) return 0

  const allow = allowanceQtyForRow(rowIndex)
  const q = Number(row.qty) || 0

  return Math.max(0, allow - q)
}


  // ----- GOLD -----
  const goldError = ref<string | null>(null)
  // A) allowance for this row (exclude THIS row) -> used for validation
  const allowanceWeightForRow = (rowIndex: number): number => {
    const row = product.goldRows[rowIndex]
    if (!row.goldSourceId) return 0

    const total = packageTotalWeight(row.goldSourceId)

    const usedByOthers = product.goldRows.reduce((sum, r, i) => {
      if (i === rowIndex) return sum
      if (r.goldSourceId !== row.goldSourceId) return sum
      return sum + (Number(r.weightUsed) || 0)
    }, 0)

    return Math.max(0, total - usedByOthers)
  }

  // B) remaining AFTER this row takes weight (include THIS row) -> used for UI display
  const remainingAfterThisRow = (rowIndex: number): number => {
    const row = product.goldRows[rowIndex]
    if (!row.goldSourceId) return 0

    const allow = allowanceWeightForRow(rowIndex)
    const w = Number(row.weightUsed) || 0

    return Math.max(0, allow - w)
  }

  const totalGoldWeight = computed(() =>
    product.goldRows.reduce((sum, r) => sum + (Number(r.weightUsed) || 0), 0)
  )
  const totalGoldPrice = computed(() =>
    product.goldRows.reduce((sum, r) => sum + (Number(r.currentPrice) || 0), 0)
  )

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
    typeDdOpen.value = false
  }

  const toggleCraftDd = (idx: number) => {
    product.goldRows.forEach((r, i) => (r.craftDdOpen = i === idx ? !r.craftDdOpen : false))
    product.goldRows.forEach((r) => (r.ddOpen = false))
    product.jewelryRows.forEach((r) => (r.ddOpen = false))
    typeDdOpen.value = false
  }

  const selectGoldSource = (idx: number, g: GoldSourceDto) => {
    const remaining = Number((g as any).remainingWeight ?? (g as any).weight ?? 0)
    if (remaining <= 0) {
      alert('This gold package has no remaining weight.')
      return
    }

    const row = product.goldRows[idx]
    row.goldSourceId = g.id
    row.sourceLabel = g.name || ''
    row.purity = (g as any).goldPurity || ''

    // IMPORTANT: don't use original weight here anymore
    row.availableWeight = remaining

    row.ddOpen = false
    row.query = ''
    validateGoldRows()
  }
  const selectCraft = (idx: number, c: CraftDto) => {
    const row = product.goldRows[idx]
    row.craftId = c.id
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
  const remainingWeightForRow = (rowIndex: number): number => {
    const row = product.goldRows[rowIndex]
    if (!row.goldSourceId) return 0

    const pkg = goldSources.value.find((x) => x.id === row.goldSourceId) as any

    // ✅ base = remaining from DB (already reduced by previous products)
    const baseRemaining = Number(pkg?.remainingWeight ?? pkg?.weight ?? 0)

    // ✅ subtract what other rows in THIS form are already using
    const usedByOtherRows = product.goldRows.reduce((sum, r, i) => {
      if (i === rowIndex) return sum
      if (r.goldSourceId !== row.goldSourceId) return sum
      return sum + (Number(r.weightUsed) || 0)
    }, 0)

    const remaining = baseRemaining - usedByOtherRows
    return remaining < 0 ? 0 : remaining
  }

  // 1) total weight of a gold package from API list
  const packageTotalWeight = (goldSourceId: number): number => {
    const pkg = goldSources.value.find((x) => x.id === goldSourceId) as any
    return Number(pkg?.remainingWeight ?? pkg?.weight ?? 0)
  }

  // 2) total used weight from ALL rows for a package (includes every row)
  const usedWeightForPackage = (goldSourceId: number): number => {
    return product.goldRows.reduce((sum, r) => {
      if (r.goldSourceId !== goldSourceId) return sum
      return sum + (Number(r.weightUsed) || 0)
    }, 0)
  }

  // 3) remaining for package AFTER all rows used (this is the real package remaining)
  const remainingWeightForPackage = (goldSourceId: number): number => {
    const pkg = goldSources.value.find((x) => x.id === goldSourceId) as any
    const baseRemaining = Number(pkg?.remainingWeight ?? pkg?.weight ?? 0)

    const usedInThisForm = product.goldRows.reduce((sum, r) => {
      if (r.goldSourceId !== goldSourceId) return sum
      return sum + (Number(r.weightUsed) || 0)
    }, 0)

    const remaining = baseRemaining - usedInThisForm
    return remaining < 0 ? 0 : remaining
  }

  const validateGoldRows = () => {
    goldError.value = null
    let hasAnyError = false

    product.goldRows.forEach((r, idx) => {
      r.weightError = ''
      r.priceError = ''
      r.craftError = ''

      // required dropdowns
      if (!r.goldSourceId) hasAnyError = true

      if (!r.craftId) {
        r.craftError = 'Craft is required.'
        hasAnyError = true
      }

      // validate only if gold source selected
      if (r.goldSourceId) {
        const w = Number(r.weightUsed) || 0
        const price = Number(r.currentPrice) || 0

        // weight required
        if (w <= 0) {
          r.weightError = 'Weight is required.'
          hasAnyError = true
        } else {
          // ✅ use allowance instead of remainingWeightForRow
          const allow = allowanceWeightForRow(idx)

          if (w > allow) {
            r.weightError = `Weight left is not enough (Remaining ${allow.toFixed(2)}).`
            hasAnyError = true
          }
        }

        // price required
        if (price <= 0) {
          r.priceError = 'Current price is required.'
          hasAnyError = true
        }
      }
    })

    if (hasAnyError) {
      goldError.value = 'Please fill the Gold Information !!.'
    }
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
    typeDdOpen.value = false
  }

  const selectJewelryPackage = (idx: number, p: GemsPackageDto) => {
    const row = product.jewelryRows[idx]
    row.gemsPackageId = (p as any).id
    row.sourceLabel = (p as any).name || ''
    row.availableQty = Number((p as any).remainingQty ?? (p as any).quantity ?? 0)
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

  product.jewelryRows.forEach((r, idx) => {
    r.qtyError = ''
    r.sellError = ''

    // dropdown required
    if (!r.gemsPackageId) {
      hasAnyError = true
      return
    }

    const qty = Number(r.qty) || 0
    const selling = Number(r.sellingPrice) || 0

    // remaining allowance for THIS row
    const allow = allowanceQtyForRow(idx)

    // qty required
    if (qty <= 0) {
      r.qtyError = 'Qty is required.'
      hasAnyError = true
    }
    // qty exceeds remaining
    else if (qty > allow) {
      r.qtyError = `Exceeds remaining qty (${allow}).`
      hasAnyError = true
    }

    // selling price required
    if (selling <= 0) {
      r.sellError = 'Selling price is required.'
      hasAnyError = true
    }
  })

  if (hasAnyError) {
    jewelryError.value = 'Please fill the Jewellery Information !!.'
  }
}

  const totalJewelryQty = computed(() =>
    product.jewelryRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0)
  )
  const totalJewelryWeight = computed(() =>
    product.jewelryRows.reduce(
      (sum, r) => sum + (Number(r.qty) || 0) * (Number(r.unitWeight) || 0),
      0
    )
  )
  const totalSellingPrice = computed(() =>
    product.jewelryRows.reduce((sum, r) => sum + (Number(r.sellingPrice) || 0), 0)
  )

  // ----- UI -----
  const closeAllDd = () => {
    product.goldRows.forEach((r) => (r.ddOpen = false))
    product.goldRows.forEach((r) => (r.craftDdOpen = false))
    product.jewelryRows.forEach((r) => (r.ddOpen = false))
    typeDdOpen.value = false
  }

  const goBack = () => router.push('/admin/products')

  const onSaveAll = async () => {
    if (!String(product.name || '').trim()) return alert('Product name is required.')
    if (!product.productTypeId || Number(product.productTypeId) <= 0)
      return alert('Product Type is required.')
    if (product.depreciation == null || Number(product.depreciation) <= 0)
      return alert('Depreciation is required.')

    validateGoldRows()
    validateJewelryRows()

    const goldMissing = product.goldRows.some((r) => !r.goldSourceId || !r.craftId)
    const jewMissing = product.jewelryRows.some((r) => !r.gemsPackageId)

    if (goldMissing) return (goldError.value = 'Please choose Gold Source + Craft for every row.')
    if (jewMissing) return (jewelryError.value = 'Please choose Jewellery package for every row.')
    if (goldError.value || jewelryError.value) return

    const payload = {
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
      productTypeId: Number(product.productTypeId),

      productGolds: product.goldRows.map((r) => ({
        goldSourceId: r.goldSourceId!,
        craftId: r.craftId!,
        weight: Number(r.weightUsed ?? 0),
        goldPurity: parsePurityToNumber(r.purity),
        currentPrice: Number(r.currentPrice ?? 0),
      })),

      productJewellerys: product.jewelryRows.map((r) => ({
        gemsPackageId: r.gemsPackageId!,
        qty: Number(r.qty ?? 0),
        sellingPrice: Number(r.sellingPrice ?? 0),
      })),
    }

    try {
      let saved: any

      if (isEdit.value) {
        const productId = Number(route.params.id)
        saved = await productsStore.updateProduct(productId, payload)
      } else {
        saved = await productsStore.createProduct(payload)
      }

      const savedId = Number(saved?.id)
      if (!savedId) throw new Error('Product saved but missing id.')

      // upload selected files -> S3 -> add to product
      for (const file of imgFiles.value) {
        const url = await productsStore.uploadToS3(file)
        await productsStore.addProductImage(savedId, { imageUrl: url })
      }

      imgFiles.value = []

      const latest = await productsStore.getProductById(savedId)
      productImages.value = latest.productImages ?? []

      alert(isEdit.value ? 'Updated successfully!' : 'Saved successfully!')
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
  /* ===== Product Images Grid (Tinder-like) ===== */

  .media-grid {
  display: grid;
  grid-template-columns: repeat(3, 160px);  /* fixed smaller size */
  gap: 14px;
  max-width: 520px; 
}

.media-card,
.media-slot {
  width: 160px;
  height: 200px;   /* smaller fixed height */
  border-radius: 14px;
}


.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* X button (top-right) */
.media-x {
  position: absolute;
  top: 8px;
  right: 8px;

  width: 30px;
  height: 30px;
  border-radius: 999px;

  border: 0;
  cursor: pointer;

  display: grid;
  place-items: center;

  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 18px;
  line-height: 1;

  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.media-card {
  position: relative;      /* IMPORTANT for .media-x absolute positioning */
  overflow: hidden;
  border-radius: 14px;
  background: #0f1117;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* optional: same for slot card */
.media-slot {
  position: relative;
}

.media-x:hover {
  background: rgba(0, 0, 0, 0.75);
}

.media-x:active {
  transform: scale(0.96);
}

/* --- Empty slot (plus box) --- */
.media-slot {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 14px;

  background: #121318;
  border: 2px dashed rgba(255, 255, 255, 0.18);

  display: grid;
  place-items: center;

  cursor: pointer;
  transition: 0.15s ease;
}

.media-slot:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: #151723;
  transform: translateY(-1px);
}

.media-slot:active {
  transform: translateY(0px) scale(0.99);
}

.media-slot:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* plus sign */
.media-plus {
  width: 56px;
  height: 56px;
  border-radius: 14px;

  display: grid;
  place-items: center;

  font-size: 34px;
  font-weight: 600;

  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.06);
}

/* hidden input (if you don't already have a global .hidden) */
.hidden {
  display: none;
}

/* Responsive: 2 columns on small screens */
@media (max-width: 520px) {
  .media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
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
  .combo {
    position: relative;
  }
  .dd {
    z-index: 9999;
  }

  /* =========================================================
   ✅ KEEP ALL YOUR EXISTING CSS BELOW (no breaking changes)
   ========================================================= */

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
    background: #fff;
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
    grid-column: 1/-1;
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
    background: #fff;
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
    background: #fff;
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

  .purityPill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 13px;
    border: 1px solid #e5e7eb;
    background: #fff;
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

  .miniTable {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow: visible;
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
    background: #fff;
    border-bottom: 1px solid #f1f5f9;
  }
  .miniTable__row:last-child {
    border-bottom: none;
  }

  /* buttons */
  .btnAdd {
    border: none;
    background: #2563eb;
    color: #fff;
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
    font-size: 13px;
  }
  .btnDel {
    border: none;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
    font-size: 13px;
  }
  .btnAdd:hover {
    filter: brightness(0.95);
  }
  .btnDel:hover {
    filter: brightness(0.97);
  }

  .totals {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  .totals__box {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #fff;
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

  .combo__btn {
    width: 100%;
    border: 1px solid #d1d5db;
    background: #fff;
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
    left: 0;
    right: 0;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 18px 45px rgba(17, 24, 39, 0.12);
    overflow: hidden;
  }
  .dd--up {
    bottom: calc(100% + 8px);
  }
  .dd__item:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .dd__item:disabled:hover {
    background: transparent;
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
    background: #fff;
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

  .saveBar {
    margin-top: 14px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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

    /* ✅ keep actions on the right even on mobile */
    .miniTable__th--actions,
    .miniTable__td--actions {
      justify-content: flex-end;
    }

    .totals {
      grid-template-columns: 1fr;
    }
  }
</style>
