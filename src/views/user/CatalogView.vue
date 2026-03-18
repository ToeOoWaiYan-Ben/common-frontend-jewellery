<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import StoreHeader from '@/components/user/StoreHeader.vue'
  import { useUserJewelryTypesStore } from '@/stores/useUserJewelryTypesStore'
  import { useProductsStore } from '@/stores/useProductsStore'
  import type { ProductDto } from '../dtos/ProductDto'

  /* ---------------- Router ---------------- */
  const route = useRoute()
  const router = useRouter()

  /* ---------------- Stores ---------------- */

  const productsStore = useProductsStore()
  const typesStore = useUserJewelryTypesStore()

  const products = computed(() => productsStore.items)
  const loading = computed(() => productsStore.loading)
  const error = computed(() => productsStore.error ?? '')

  /* ---------------- Type (Hero) ---------------- */
  const selectedTypeId = computed<number | null>(() => {
    const id = route.query.typeId
    return id ? Number(id) : null
  })

  const selectedType = computed(() => {
    if (selectedTypeId.value == null) return null
    return typesStore.items.find((t: any) => Number(t.id) === Number(selectedTypeId.value)) || null
  })

  const heroTitle = computed(() => selectedType.value?.name ?? 'Jewelry Collection')
  const heroDesc = computed(
    () => selectedType.value?.description ?? 'The perfect choice for an elegant outfit.'
  )
  const heroImageUrl = computed(() => selectedType.value?.imageUrl ?? '/default-hero1.jpg')

  /* ---------------- Drawer ---------------- */
  const drawerOpen = ref(false)
  const drawerMode = ref<'filter' | 'sort'>('filter')

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

  /* ---------------- Pagination ---------------- */
  const currentPage = ref(1)
  const pageSize = ref(20)

  /* ---------------- Sort ---------------- */
  const sortBy = ref<'relevance' | 'new' | 'priceLow' | 'priceHigh'>('relevance')

  /* ---------------- Filters (ALIGNED WITH YOUR PRODUCT ENTITY) ----------------
   Product fields we use:
   - stockStatus (String)
   - color (String)
   - collection (String)
   - productTypeId (Long)
   - finalPrice (Float)
   - createdAt (LocalDateTime)
---------------------------------------------------------------------------- */
  const selectedStock = ref<string[]>([]) // e.g. ['IN_STOCK','OUT_OF_STOCK','BACKORDER']
  const selectedColors = ref<string[]>([])
  const selectedCollections = ref<string[]>([])
  const selectedTypeIds = ref<number[]>([])

  const priceMin = ref<number | null>(null)
  const priceMax = ref<number | null>(null)

  /* accordion states (keep your UI) */
  const acc = ref({
    stock: false,
    color: false,
    collection: false,
    type: false,
    price: false,
  })

  /* color chips (keep your UI) */
  const colors = [
    { name: 'White', hex: '#f2f2f2' },
    { name: 'Blue', hex: '#2d5bff' },
    { name: 'Pink', hex: '#ff3ea5' },
    { name: 'Green', hex: '#1fa44a' },
    { name: 'Black', hex: '#111111' },
    { name: 'Purple', hex: '#7b5cff' },
  ]

  function toggleColor(name: string) {
    const idx = selectedColors.value.indexOf(name)
    if (idx >= 0) selectedColors.value.splice(idx, 1)
    else selectedColors.value.push(name)
  }

  function toggleStock(status: string) {
    const idx = selectedStock.value.indexOf(status)
    if (idx >= 0) selectedStock.value.splice(idx, 1)
    else selectedStock.value.push(status)
  }

  /* dynamic filter options */
  const collections = computed(() => {
    const set = new Set<string>()
    for (const p of products.value as any[]) {
      const v = String(p.collection ?? '').trim()
      if (v) set.add(v)
    }
    return Array.from(set).sort()
  })

  const jewelryTypes = computed(() => typesStore.items ?? [])

  /* ---------------- Helpers ---------------- */
  function getFinalPrice(p: ProductDto) {
    const raw = (p as any).finalPrice ?? (p as any).final_price ?? null
    return raw != null ? Number(raw) : 0
  }

  function getThumb(p: ProductDto) {
    return p.productImages?.[0]?.imageUrl || 'https://via.placeholder.com/400x400?text=Product'
  }

  function getDesc(p: ProductDto) {
    return p.shortDesc && p.shortDesc.trim() ? p.shortDesc : p.desc || ''
  }

  function formatPrice(v: number) {
    return (
      new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(v ?? 0)) + ' MMK'
    )
  }

  function openDetail(p: ProductDto) {
    router.push({
      name: 'user-product-detail',
      params: { id: (p as any).id },
      query: { category: route.query.category },
    })
  }

  /* ---------------- Filter actions ---------------- */
  function resetFilters() {
    selectedStock.value = []
    selectedColors.value = []
    selectedCollections.value = []
    selectedTypeIds.value = []
    priceMin.value = null
    priceMax.value = null
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

  /* ---------------- Filtering + Sorting ---------------- */
  const filteredProducts = computed<ProductDto[]>(() => {
    let list = [...(products.value as ProductDto[])]

    // stock status
    if (selectedStock.value.length) {
      list = list.filter((p: any) => selectedStock.value.includes(String(p.stockStatus ?? '')))
    }

    // colors
    if (selectedColors.value.length) {
      list = list.filter((p: any) => selectedColors.value.includes(String(p.color ?? '')))
    }

    // collections
    if (selectedCollections.value.length) {
      list = list.filter((p: any) => selectedCollections.value.includes(String(p.collection ?? '')))
    }

    // types (productTypeId)
    if (selectedTypeIds.value.length) {
      list = list.filter((p: any) => selectedTypeIds.value.includes(Number(p.productTypeId ?? 0)))
    }

    // price
    if (priceMin.value != null) list = list.filter((p) => getFinalPrice(p) >= priceMin.value!)
    if (priceMax.value != null) list = list.filter((p) => getFinalPrice(p) <= priceMax.value!)

    // sorting
    if (sortBy.value === 'priceLow') list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b))
    if (sortBy.value === 'priceHigh') list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a))
    if (sortBy.value === 'new') {
      list.sort((a: any, b: any) => {
        const da = new Date(a.createdAt ?? 0).getTime()
        const db = new Date(b.createdAt ?? 0).getTime()
        return db - da
      })
    }

    return list
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value))
  )

  const pagedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
  })

  watch(filteredProducts, () => {
    currentPage.value = 1
  })

  /* ---------------- Load data ---------------- */
  async function loadProducts() {
    if (selectedTypeId.value != null) {
      await productsStore.loadByTypeId(selectedTypeId.value)
    } else {
      await productsStore.loadProducts()
    }
  }

  onMounted(async () => {
    if (!typesStore.items.length) await typesStore.loadAll()
    await loadProducts()
  })

  watch(selectedTypeId, loadProducts)
</script>

<template>
  <div class="catalog">
    <StoreHeader />

    <!-- HERO -->
    <section class="sw-hero">
      <div class="sw-hero__bg" :style="{ backgroundImage: `url(${heroImageUrl})` }"></div>

      <div class="sw-hero__content">
        <div class="sw-crumbs">
          <router-link to="/user/catalog" class="breadcrumb-link">Home</router-link>
          <span class="sw-sep">/</span>

          <span class="sw-crumb--active">{{ heroTitle }}</span>
        </div>

        <h1 class="sw-hero__title">{{ heroTitle }}</h1>
        <p class="sw-hero__desc">{{ heroDesc }}</p>
      </div>
    </section>

    <!-- TOP BAR + RESULTS -->
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
          <article v-for="p in pagedProducts" :key="(p as any).id" class="sw-card">
            <div class="sw-img" role="button" tabindex="0" @click="openDetail(p)">
              <img :src="getThumb(p)" :alt="(p as any).name" />
            </div>

            <div class="sw-info">
              <h3 class="sw-title" @click="openDetail(p)">{{ (p as any).name }}</h3>

              <p class="sw-sub">
                {{ getDesc(p) }}
              </p>

              <div class="sw-price">
                {{ formatPrice(getFinalPrice(p)) }}
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
        <!-- Stock Status -->
        <button class="sw-accHead" type="button" @click="acc.stock = !acc.stock">
          <span>Stock Status</span>
          <span class="sw-accChevron" :class="{ open: acc.stock }">⌄</span>
        </button>

        <div v-if="acc.stock" class="sw-accBody">
          <label class="sw-checkRow">
            <input
              type="checkbox"
              :checked="selectedStock.includes('IN_STOCK')"
              @change="toggleStock('IN_STOCK')"
            />
            In Stock
          </label>

          <label class="sw-checkRow">
            <input
              type="checkbox"
              :checked="selectedStock.includes('OUT_OF_STOCK')"
              @change="toggleStock('OUT_OF_STOCK')"
            />
            Out of Stock
          </label>

          <label class="sw-checkRow">
            <input
              type="checkbox"
              :checked="selectedStock.includes('BACKORDER')"
              @change="toggleStock('BACKORDER')"
            />
            Backorder
          </label>
        </div>

        <div class="sw-sep2"></div>

        <!-- Collection -->
        <button class="sw-accHead" type="button" @click="acc.collection = !acc.collection">
          <span>Collection</span>
          <span class="sw-accChevron" :class="{ open: acc.collection }">⌄</span>
        </button>

        <div v-if="acc.collection" class="sw-accBody">
          <label v-for="c in collections" :key="c" class="sw-checkRow">
            <input type="checkbox" :value="c" v-model="selectedCollections" />
            {{ c }}
          </label>

          <div v-if="!collections.length" class="empty">No collections.</div>
        </div>

        <div class="sw-sep2"></div>

        <!-- Jewelry Type -->
        <button class="sw-accHead" type="button" @click="acc.type = !acc.type">
          <span>Jewelry Type</span>
          <span class="sw-accChevron" :class="{ open: acc.type }">⌄</span>
        </button>

        <div v-if="acc.type" class="sw-accBody">
          <label v-for="t in jewelryTypes" :key="t.id" class="sw-checkRow">
            <input type="checkbox" :value="Number(t.id)" v-model="selectedTypeIds" />
            {{ t.name }}
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
  <footer class="mf-footer">
    <div class="mf-footer__content">
      <h2 class="mf-footer__title">MYIT TAR OO</h2>

      <div class="mf-footer__subtitle">Diamonds and Fine Jewellery</div>

      <p class="mf-footer__text">
        Address: No.23, 29th Street (Lower Block), Pabedan Township, Yangon.
      </p>

      <p class="mf-footer__text">Ph: 09785166189, 095166189</p>

      <div class="mf-footer__social">
        <a
          href="https://web.facebook.com/myittaroo1996?mibextid=wwXIfr&rdid=es9Muc0qFthaPjMN&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F1C1eJmdpKt%2F%3Fmibextid%3DwwXIfr%26_rdc%3D1%26_rdr%3D1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
      </div>
    </div>

    <div class="mf-footer__bottom">© 2026 MYIT TAR OO Diamonds and Fine Jewellery</div>
  </footer>
</template>

<style scoped src="@/styles/user/catalog.css"></style>

<style scoped>
  .mf-footer {
    margin-top: 80px;
    padding: 60px 20px 20px;
    background: #fafafa;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .mf-footer__content {
    max-width: 800px;
    margin: 0 auto;
  }

  .mf-footer__title {
    font-size: 32px;
    letter-spacing: 0.18em;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .mf-footer__subtitle {
    font-size: 16px;
    color: #8c8c8c;
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }

  .mf-footer__text {
    font-size: 15px;
    color: #444;
    margin-bottom: 8px;
  }

  .mf-footer__social {
    margin-top: 18px;
  }

  .mf-footer__social a {
    text-decoration: none;
    color: #b8924f;
    font-weight: 500;
  }

  .mf-footer__bottom {
    margin-top: 35px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
    font-size: 13px;
    color: #777;
  }
</style>
