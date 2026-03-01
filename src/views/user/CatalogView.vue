<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import StoreHeader from '@/components/user/StoreHeader.vue'
  import { useUserJewelryTypesStore } from '@/stores/useUserJewelryTypesStore'

  import type { ProductDto } from '../dtos/ProductDto'
  import { watch } from 'vue'
  import axios from 'axios'
  import { useProductsStore } from '@/stores/useProductsStore'
  const route = useRoute()
  const productsStore = useProductsStore() // or useUserProductsStore if that’s your name
  const products = computed(() => productsStore.items)
  const loading = computed(() => productsStore.loading)
  const error = computed(() => productsStore.error ?? '')

  import { useRoute } from 'vue-router'

  const typesStore = useUserJewelryTypesStore()

  const heroTitle = computed(() => selectedType.value?.name ?? 'Jewelry Collection')

  const heroDesc = computed(
    () => selectedType.value?.description ?? 'The perfect choice for an elegant outfit.'
  )

  const heroImageUrl = computed(() => selectedType.value?.imageUrl ?? '/default-hero.jpg')

  const category = computed(() => (route.query.category as string) || null)

  type Product = {
    id: number
    name: string
    price: number
    imageUrl: string
    badge?: 'New' | 'Sale' | ''
    subtitle?: string
    color?: string
    material?: string
  }
  onMounted(async () => {
    if (typesStore.items.length === 0) {
      await typesStore.loadAll()
    }
  })
  function getPrice(p: ProductDto) {
    return Number(p.finalPrice ?? 0)
  }

  const selectedType = computed(() => {
    return typesStore.items.find((t) => t.id === selectedTypeId.value) || null
  })

  const router = useRouter()

  /* ---------- Hero ---------- */
  /* ---------- State ---------- */

  /* ---------- Drawer ---------- */
  const drawerOpen = ref(false)
  const drawerMode = ref<'filter' | 'sort'>('filter')

  /* ---------- Pagination ---------- */
  const currentPage = ref(1)
  const pageSize = ref(20)

  /* ---------- Sort ---------- */
  const sortBy = ref<'relevance' | 'new' | 'priceLow' | 'priceHigh'>('relevance')

  /* ---------- Filters ---------- */
  const availableOnline = ref(false) // UI only
  const shopBy = ref({ sale: false, new: false, onlineExclusive: false })
  const selectedColors = ref<string[]>([])
  const selectedMaterials = ref<string[]>([])
  const priceMin = ref<number | null>(null)
  const priceMax = ref<number | null>(null)
  const reduction = ref('') // UI only for now

  const acc = ref({
    shopBy: true,
    color: false,
    material: false,
    price: false,
    reduction: false,
  })

  const colors = [
    { name: 'White', hex: '#f2f2f2' },
    { name: 'Blue', hex: '#2d5bff' },
    { name: 'Pink', hex: '#ff3ea5' },
    { name: 'Green', hex: '#1fa44a' },
    { name: 'Black', hex: '#111111' },
    { name: 'Purple', hex: '#7b5cff' },
  ]

  const materials = [
    'Crystal pearl',
    'Gold-tone finish',
    'Mixed metal finish',
    'Rhodium plated',
    'Rose gold-tone finish',
    'Cubic Zirconia',
  ]

  function toggleColor(name: string) {
    if (selectedColors.value.includes(name)) {
      selectedColors.value = selectedColors.value.filter((x) => x !== name)
    } else {
      selectedColors.value.push(name)
    }
  }

  function openFilter() {
    drawerMode.value = 'filter'
    drawerOpen.value = true
  }
  function openSort() {
    drawerMode.value = 'sort'
    drawerOpen.value = true
  }
  function closeDrawer() {
    drawerOpen.value = false
  }

  function resetFilters() {
    availableOnline.value = false
    shopBy.value = { sale: false, new: false, onlineExclusive: false }
    selectedColors.value = []
    selectedMaterials.value = []
    priceMin.value = null
    priceMax.value = null
    reduction.value = ''
    currentPage.value = 1
  }

  function applyFilters() {
    currentPage.value = 1
    closeDrawer()
  }

  function applySort() {
    currentPage.value = 1
    closeDrawer()
  }

  function formatPrice(v: number) {
    return (
      new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(v) + ' MMK'
    )
  }
  function openDetail(p: Product) {
    router.push({
      name: 'user-product-detail',
      params: { id: p.id },
      query: { category: route.query.category },
      // ✅ KEEP CATEGORY
    })
  }
  function toggleWish(_p: Product) {
    // optional for UI
  }
  function getThumb(p: ProductDto) {
    return p.productImages?.[0]?.imageUrl || 'https://via.placeholder.com/400x400?text=Product'
  }
  function getDesc(p: ProductDto) {
    return p.shortDesc && p.shortDesc.trim() ? p.shortDesc : p.desc || ''
  }
  function getTotalPrice(p: ProductDto) {
    return (p.productJewellerys ?? []).reduce(
      (sum: number, r: any) => sum + (Number(r?.sellingPrice) || 0),
      0
    )
  }

  function getFinalPrice(p: ProductDto) {
    const raw = (p as any).finalPrice ?? (p as any).final_price ?? null

    if (raw != null && Number(raw) > 0) {
      return Number(raw)
    }

    return (p.productJewellerys ?? []).reduce(
      (sum: number, r: any) => sum + (Number(r?.sellingPrice) || 0),
      0
    )
  }

  /* ---------- Filtering + Sorting ---------- */
  const filteredProducts = computed(() => {
    let list = [...products.value]

    // shop by
    if (shopBy.value.sale) list = list.filter((p) => p.badge === 'Sale')
    if (shopBy.value.new) list = list.filter((p) => p.badge === 'New')

    // colors
    if (selectedColors.value.length) {
      list = list.filter((p) => p.color && selectedColors.value.includes(p.color))
    }

    // materials
    if (selectedMaterials.value.length) {
      list = list.filter((p) => p.material && selectedMaterials.value.includes(p.material))
    }

    // price
    if (priceMin.value != null) list = list.filter((p) => getFinalPrice(p) >= priceMin.value!)
    if (priceMax.value != null) list = list.filter((p) => getFinalPrice(p) <= priceMax.value!)

    if (sortBy.value === 'priceLow') list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b))
    if (sortBy.value === 'priceHigh') list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a))
    // (new/relevance demo: keep original order)
    return list
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value))
  )

  const pagedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
  })
  const selectedTypeId = computed(() => {
    const id = route.query.typeId
    return id ? Number(id) : null
  })

  async function loadProducts() {
    if (selectedTypeId.value !== null) {
      await productsStore.loadByTypeId(selectedTypeId.value)
    } else {
      productsStore.items = []
    }
  }
  onMounted(loadProducts)
  watch(selectedTypeId, loadProducts)
</script>

<template>
  <div class="catalog">
    <StoreHeader />

    <!-- ✅ HERO -->
    <section class="sw-hero">
      <div class="sw-hero__bg" :style="{ backgroundImage: `url(${heroImageUrl})` }"></div>

      <div class="sw-hero__content">
        <div class="sw-crumbs">
          <span>Home</span>
          <span class="sw-sep">/</span>
          <span>Jewelry</span>
          <span class="sw-sep">/</span>
          <span class="sw-crumb--active">{{ heroTitle }}</span>
        </div>

        <h1 class="sw-hero__title">{{ heroTitle }}</h1>
        <p class="sw-hero__desc">{{ heroDesc }}</p>
      </div>
    </section>

    <!-- ✅ FULL WIDTH bar + results -->
    <section class="sw-resultsFull">
      <div class="swbar">
        <div class="swbar__count">{{ filteredProducts.length }} Results</div>

        <div class="swbar__right">
          <button class="swbtn" type="button" @click="openFilter">
            <span class="swbtn__icon">⎘</span>
            Filters
          </button>

          <button class="swbtn" type="button" @click="openSort">
            <span class="swbtn__icon">⇅</span>
            Sort by
          </button>
        </div>
      </div>

      <div class="results">
        <div v-if="loading" class="sw-loading">Loading...</div>
        <div v-else-if="error" class="sw-error">{{ error }}</div>

        <div v-else class="grid sw-grid">
          <article v-for="p in pagedProducts" :key="p.id" class="sw-card">
            <button
              class="sw-heart"
              type="button"
              @click.stop="toggleWish(p)"
              aria-label="Add to wishlist"
            >
              ♡
            </button>

            <div class="sw-img" role="button" tabindex="0" @click="openDetail(p)">
              <img :src="getThumb(p)" :alt="p.name" />
            </div>

            <div class="sw-info">
              <h3 class="sw-title" @click="openDetail(p)">{{ p.name }}</h3>

              <p class="sw-sub">
                {{ getDesc(p) }}
              </p>

              <div class="sw-price">
                {{ formatPrice(getPrice(p)) }}
              </div>
            </div>
          </article>
        </div>

        <!-- pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
            Prev
          </button>

          <button
            v-for="n in totalPages"
            :key="n"
            class="pagination-btn"
            :class="{ 'pagination-btn--active': n === currentPage }"
            @click="currentPage = n"
          >
            {{ n }}
          </button>

          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <!-- overlay -->
    <div v-if="drawerOpen" class="sw-overlay" @click="closeDrawer"></div>

    <!-- FILTER DRAWER -->
    <aside v-if="drawerOpen && drawerMode === 'filter'" class="sw-drawer" @click.stop>
      <div class="sw-drawer__head">
        <div class="sw-drawer__title">Filters</div>
        <button class="sw-x" type="button" @click="closeDrawer">✕</button>
      </div>

      <div class="sw-drawer__body">
        <div class="sw-row">
          <div class="sw-row__label">Available online</div>
          <button
            class="sw-toggle"
            :class="{ on: availableOnline }"
            type="button"
            @click="availableOnline = !availableOnline"
          >
            <span class="sw-toggle__dot"></span>
          </button>
        </div>

        <div class="sw-sep2"></div>

        <!-- Shop By -->
        <button class="sw-accHead" type="button" @click="acc.shopBy = !acc.shopBy">
          <span>Shop By</span>
          <span class="sw-accChevron" :class="{ open: acc.shopBy }">⌄</span>
        </button>
        <div v-if="acc.shopBy" class="sw-accBody">
          <label class="sw-checkRow">
            <input type="checkbox" v-model="shopBy.sale" />
            Sale
          </label>
          <label class="sw-checkRow">
            <input type="checkbox" v-model="shopBy.new" />
            New
          </label>
          <label class="sw-checkRow">
            <input type="checkbox" v-model="shopBy.onlineExclusive" />
            Online exclusive
          </label>
        </div>

        <div class="sw-sep2"></div>

        <!-- Color -->
        <button class="sw-accHead" type="button" @click="acc.color = !acc.color">
          <span>Color</span>
          <span class="sw-accChevron" :class="{ open: acc.color }">⌄</span>
        </button>
        <div v-if="acc.color" class="sw-accBody">
          <button
            v-for="c in colors"
            :key="c.name"
            class="sw-colorRow"
            type="button"
            @click="toggleColor(c.name)"
          >
            <span class="sw-colorBox" :style="{ background: c.hex }"></span>
            <span class="sw-colorName">{{ c.name }}</span>
            <span class="sw-colorTick">{{ selectedColors.includes(c.name) ? '✓' : '' }}</span>
          </button>
        </div>

        <div class="sw-sep2"></div>

        <!-- Material -->
        <button class="sw-accHead" type="button" @click="acc.material = !acc.material">
          <span>Material</span>
          <span class="sw-accChevron" :class="{ open: acc.material }">⌄</span>
        </button>
        <div v-if="acc.material" class="sw-accBody">
          <label v-for="m in materials" :key="m" class="sw-checkRow">
            <input type="checkbox" :value="m" v-model="selectedMaterials" />
            {{ m }}
          </label>
        </div>

        <div class="sw-sep2"></div>

        <!-- Price -->
        <button class="sw-accHead" type="button" @click="acc.price = !acc.price">
          <span>Price Range</span>
          <span class="sw-accChevron" :class="{ open: acc.price }">⌄</span>
        </button>
        <div v-if="acc.price" class="sw-accBody">
          <div class="sw-priceWrap">
            <div class="sw-price__field">
              <div class="sw-price__label">Min. Price</div>
              <input
                class="sw-price__input"
                type="number"
                v-model.number="priceMin"
                placeholder="0"
              />
            </div>
            <div class="sw-price__field">
              <div class="sw-price__label">Max. Price</div>
              <input
                class="sw-price__input"
                type="number"
                v-model.number="priceMax"
                placeholder="999999"
              />
            </div>
          </div>
        </div>

        <div class="sw-sep2"></div>

        <!-- Reductions -->
        <button class="sw-accHead" type="button" @click="acc.reduction = !acc.reduction">
          <span>Reductions by %</span>
          <span class="sw-accChevron" :class="{ open: acc.reduction }">⌄</span>
        </button>
        <div v-if="acc.reduction" class="sw-accBody">
          <button class="sw-radio2" type="button" @click="reduction = ''">
            All <span>{{ reduction === '' ? '✓' : '' }}</span>
          </button>
          <button class="sw-radio2" type="button" @click="reduction = '20'">
            20% <span>{{ reduction === '20' ? '✓' : '' }}</span>
          </button>
          <button class="sw-radio2" type="button" @click="reduction = '30'">
            30% <span>{{ reduction === '30' ? '✓' : '' }}</span>
          </button>
          <button class="sw-radio2" type="button" @click="reduction = '40'">
            40% <span>{{ reduction === '40' ? '✓' : '' }}</span>
          </button>
        </div>
      </div>

      <div class="sw-drawer__foot">
        <button class="sw-footBtn sw-footBtn--ghost" type="button" @click="resetFilters">
          Reset all
        </button>
        <button class="sw-footBtn" type="button" @click="applyFilters">
          Show {{ filteredProducts.length }} products
        </button>
      </div>
    </aside>

    <!-- SORT DRAWER -->
    <aside v-if="drawerOpen && drawerMode === 'sort'" class="sw-drawer" @click.stop>
      <div class="sw-drawer__head">
        <div class="sw-drawer__title">Sort by</div>
        <button class="sw-x" type="button" @click="closeDrawer">✕</button>
      </div>

      <div class="sw-drawer__body">
        <div class="sw-sortList">
          <button
            class="sw-radio"
            :class="{ 'is-active': sortBy === 'relevance' }"
            type="button"
            @click="sortBy = 'relevance'"
          >
            Relevance <span class="sw-check">{{ sortBy === 'relevance' ? '✓' : '' }}</span>
          </button>
          <button
            class="sw-radio"
            :class="{ 'is-active': sortBy === 'new' }"
            type="button"
            @click="sortBy = 'new'"
          >
            New in <span class="sw-check">{{ sortBy === 'new' ? '✓' : '' }}</span>
          </button>
          <button
            class="sw-radio"
            :class="{ 'is-active': sortBy === 'priceLow' }"
            type="button"
            @click="sortBy = 'priceLow'"
          >
            Price (lowest first)
            <span class="sw-check">{{ sortBy === 'priceLow' ? '✓' : '' }}</span>
          </button>
          <button
            class="sw-radio"
            :class="{ 'is-active': sortBy === 'priceHigh' }"
            type="button"
            @click="sortBy = 'priceHigh'"
          >
            Price (highest first)
            <span class="sw-check">{{ sortBy === 'priceHigh' ? '✓' : '' }}</span>
          </button>
        </div>
      </div>

      <div class="sw-drawer__foot">
        <button class="sw-footBtn sw-footBtn--ghost" type="button" @click="closeDrawer">
          Close
        </button>
        <button class="sw-footBtn" type="button" @click="applySort">Apply</button>
      </div>
    </aside>
  </div>
</template>

<style scoped src="@/styles/user/catalog.css">
  .sw-sub {
    margin: 6px 0 10px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.35;

    display: -webkit-box;
    -webkit-line-clamp: 2; /* show 2 lines only */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
