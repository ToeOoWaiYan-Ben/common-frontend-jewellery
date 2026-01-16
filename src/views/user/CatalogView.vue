<template>
  <div class="catalog">
    <!-- ✅ HERO -->
    <section class="sw-hero">
      <!-- ✅ Background image layer (this is what you were missing) -->
      <div
        class="sw-hero__bg"
        :style="{ backgroundImage: `url(${heroImageUrl})` }"
        aria-hidden="true"
      ></div>

      <div class="sw-hero__content">
        <div class="sw-crumbs">
          <span>Home</span>
          <span class="sw-sep">/</span>
          <span>Jewelry</span>
          <span class="sw-sep">/</span>
          <span class="sw-crumb--active">Collection</span>
        </div>

        <h1 class="sw-hero__title">Jewelry Collection</h1>
        <p class="sw-hero__desc">
          The perfect choice for an elegant outfit. Discover premium rings, necklaces, and earrings
          designed for everyday shine.
        </p>
      </div>
    </section>

    <!-- ✅ FULL WIDTH bar -->
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
              <img :src="p.imageUrl" :alt="p.name" />
            </div>

            <div class="sw-info">
              <div class="sw-smallLine">
                <span
                  v-if="p.badge"
                  class="sw-badgeText"
                  :class="p.badge === 'Sale' ? 'sale' : 'new'"
                >
                  {{ p.badge }}
                </span>
              </div>

              <h3 class="sw-title" @click="openDetail(p)">{{ p.name }}</h3>

              <p v-if="p.subtitle" class="sw-sub">
                {{ p.subtitle }}
              </p>

              <div class="sw-price">{{ formatPrice(p.price) }}</div>
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

    <!-- ✅ Overlay -->
    <div v-if="drawerOpen" class="sw-overlay" @click="closeDrawer"></div>

    <!-- ✅ FILTER DRAWER -->
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

    <!-- ✅ SORT DRAWER -->
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

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { http } from '../../services/http'

  type Product = {
    id: number
    name: string
    price: number
    imageUrl?: string
    badge?: string
    subtitle?: string
    category?: string
    color?: string
    material?: string
  }

  const router = useRouter()

  const loading = ref(false)
  const error = ref('')
  const products = ref<Product[]>([])

  const heroImageUrl = ref(
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=2400&q=70'
  )

  const drawerOpen = ref(false)
  const drawerMode = ref<'filter' | 'sort'>('filter')

  const currentPage = ref(1)
  const pageSize = ref(20)

  const sortBy = ref<'relevance' | 'new' | 'priceLow' | 'priceHigh'>('relevance')

  /* Filter states */
  const availableOnline = ref(false)
  const shopBy = ref({ sale: false, new: false, onlineExclusive: false })
  const selectedColors = ref<string[]>([])
  const selectedMaterials = ref<string[]>([])
  const priceMin = ref<number | null>(null)
  const priceMax = ref<number | null>(null)
  const reduction = ref('')

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

  const filteredProducts = computed(() => {
    let list = [...products.value]

    // example filters (safe defaults)
    if (shopBy.value.sale) list = list.filter((p) => p.badge === 'Sale')
    if (shopBy.value.new) list = list.filter((p) => p.badge === 'New')
    if (selectedColors.value.length)
      list = list.filter((p) => p.color && selectedColors.value.includes(p.color))
    if (selectedMaterials.value.length)
      list = list.filter((p) => p.material && selectedMaterials.value.includes(p.material))
    if (priceMin.value != null) list = list.filter((p) => p.price >= priceMin.value!)
    if (priceMax.value != null) list = list.filter((p) => p.price <= priceMax.value!)

    // sort
    if (sortBy.value === 'priceLow') list.sort((a, b) => a.price - b.price)
    if (sortBy.value === 'priceHigh') list.sort((a, b) => b.price - a.price)

    return list
  })

  const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize.value))

  const pagedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
  })

  function formatPrice(v: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(v)
  }

  function openDetail(p: Product) {
    router.push({ name: 'product-detail', params: { id: p.id } })
  }

  function toggleWish(_p: Product) {
    // optional
  }

  async function loadProducts() {
    try {
      loading.value = true
      error.value = ''
      const res = await http.get('/products')
      const data = Array.isArray(res.data) ? res.data : []

      // ✅ If backend returns less than 20, we duplicate to make 20 cards for UI testing
      const many: Product[] = []
      for (let i = 0; i < 20; i++) {
        const base = data[i % Math.max(1, data.length)] ?? {
          id: i + 1,
          name: `Product ${i + 1}`,
          price: 1500 + i * 99,
          imageUrl:
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=60',
        }
        many.push({
          ...base,
          id: base.id ?? i + 1,
          color: base.color ?? colors[i % colors.length].name,
          material: base.material ?? materials[i % materials.length],
          subtitle: base.subtitle ?? 'Elegant jewelry piece for everyday wear.',
          badge: base.badge ?? (i % 6 === 0 ? 'Sale' : i % 5 === 0 ? 'New' : ''),
        })
      }
      products.value = many
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadProducts)
</script>

<!-- ✅ IMPORTANT: you said no style inside .vue, so keep empty -->
