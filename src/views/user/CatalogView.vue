<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StoreHeader from '@/components/user/StoreHeader.vue'

type Product = {
  id: number
  name: string
  price: number
  badge?: 'New' | 'Sale'
  subtitle?: string
  imageUrl: string
  category?: string
}

const router = useRouter()
const route = useRoute()

/* ---------------- Images ---------------- */
const img1 =
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=60'
const img2 =
  'https://images.unsplash.com/photo-1601121141461-9d6644b2925b?auto=format&fit=crop&w=1200&q=60'
const img3 =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=60'
const img4 =
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=60'
const img5 =
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=60'
const img6 =
  'https://images.unsplash.com/photo-1520975958225-7e4efb3a9e77?auto=format&fit=crop&w=1200&q=60'
const img7 =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=60'
const img8 =
  'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1200&q=60'
const img9 =
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=60'
const img10 =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=60'

/* ---------------- Demo products (20) ---------------- */
const products = ref<Product[]>([
  { id: 1, name: 'Idyllia motif ring', subtitle: 'Mixed cuts, Heart, Pink, Mixed metal finish', price: 820, badge: 'New', imageUrl: img1, category: 'Rings' },
  { id: 2, name: 'Hyperbola ring', subtitle: 'Round cut, White, Rhodium plated', price: 650, badge: 'Sale', imageUrl: img2, category: 'Rings' },
  { id: 3, name: 'Stilla cocktail ring', subtitle: 'Round cut, Pavé, White, Rhodium plated', price: 490, badge: 'Sale', imageUrl: img3, category: 'Rings' },
  { id: 4, name: 'Matrix ring', subtitle: 'Baguette cut, Blue, Rhodium plated', price: 390, badge: 'Sale', imageUrl: img4, category: 'Rings' },

  { id: 5, name: 'Pearl drop earrings', subtitle: 'Crystal pearl, White, Rhodium plated', price: 520, badge: 'New', imageUrl: img5, category: 'Earrings' },
  { id: 6, name: 'Classic necklace', subtitle: 'Crystal, Silver tone, Minimal', price: 710, imageUrl: img6, category: 'Necklaces' },
  { id: 7, name: 'Halo pendant', subtitle: 'Round cut, White, Silver tone', price: 590, badge: 'New', imageUrl: img7, category: 'Pendants' },
  { id: 8, name: 'Elegant hoop earrings', subtitle: 'Hoop earrings, Crystal, Silver tone', price: 460, imageUrl: img8, category: 'Earrings' },

  { id: 9, name: 'Stackable ring set', subtitle: '3-piece set, Mixed cuts, Silver tone', price: 880, badge: 'Sale', imageUrl: img9, category: 'Rings' },
  { id: 10, name: 'Choker necklace', subtitle: 'Crystal line, White, Rhodium plated', price: 990, badge: 'New', imageUrl: img10, category: 'Chokers' },

  { id: 11, name: 'Stud earrings', subtitle: 'Round cut, White, Minimal', price: 320, imageUrl: img5, category: 'Stud earrings' },
  { id: 12, name: 'Statement necklace', subtitle: 'Mixed stones, Silver tone finish', price: 1450, badge: 'Sale', imageUrl: img6, category: 'Necklaces' },
  { id: 13, name: 'Heart pendant', subtitle: 'Heart cut, Pink, Silver tone', price: 610, imageUrl: img7, category: 'Pendants' },
  { id: 14, name: 'Mini hoop earrings', subtitle: 'Small hoops, White crystal', price: 410, imageUrl: img8, category: 'Hoop earrings' },

  { id: 15, name: 'Baguette ring', subtitle: 'Baguette cut, White, Rhodium plated', price: 530, badge: 'New', imageUrl: img4, category: 'Rings' },
  { id: 16, name: 'Tennis bracelet', subtitle: 'Line bracelet, White, Silver tone', price: 1250, imageUrl: img9, category: 'Bracelets' },
  { id: 17, name: 'Pavé ring', subtitle: 'Pavé setting, White, Silver tone', price: 570, imageUrl: img3, category: 'Rings' },
  { id: 18, name: 'Crystal pendant', subtitle: 'Single stone, White, Minimal', price: 450, badge: 'Sale', imageUrl: img7, category: 'Pendants' },

  { id: 19, name: 'Long drop earrings', subtitle: 'Elegant drop, White crystal', price: 680, imageUrl: img5, category: 'Earrings' },
  { id: 20, name: 'Layered necklace', subtitle: '2-layer chain, Silver tone', price: 780, imageUrl: img6, category: 'Necklaces' },
])

/* ---------------- UI State ---------------- */
const selectedCategory = ref<string>((route.query.category as string) || 'All')
const availableOnline = ref(false)
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const sortBy = ref<'relevance' | 'new' | 'priceLow' | 'priceHigh'>('relevance')

const showSort = ref(false)
const showFilter = ref(false)

/* ✅ Show 20 results */
const pageSize = ref(10)
const currentPage = ref(1)

watch(
  () => route.query.category,
  (v) => {
    selectedCategory.value = (v as string) || 'All'
    currentPage.value = 1
  }
)

const categories = computed(() => {
  const set = new Set<string>()
  products.value.forEach((p) => p.category && set.add(p.category))
  return ['All', ...Array.from(set)]
})

const filteredProducts = computed(() => {
  let arr = [...products.value]

  if (selectedCategory.value !== 'All') {
    arr = arr.filter((p) => p.category === selectedCategory.value)
  }

  if (priceMin.value != null) arr = arr.filter((p) => p.price >= priceMin.value!)
  if (priceMax.value != null) arr = arr.filter((p) => p.price <= priceMax.value!)

  // UI demo toggle (no real data behind it yet)
  if (availableOnline.value) arr = arr

  if (sortBy.value === 'new') {
    arr = arr.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0))
  } else if (sortBy.value === 'priceLow') {
    arr = arr.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'priceHigh') {
    arr = arr.sort((a, b) => b.price - a.price)
  }

  return arr
})

const totalResults = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value)))

const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredProducts.value.slice(start, start + pageSize.value)
})

function formatPrice(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function openDetail(p: Product) {
  router.push(`/user/product/${p.id}`)
}

function toggleWish(p: Product) {
  alert(`Wishlist: ${p.name}`)
}

function resetAllFilters() {
  availableOnline.value = false
  selectedCategory.value = 'All'
  priceMin.value = null
  priceMax.value = null
  currentPage.value = 1
}

function applyFilters() {
  currentPage.value = 1
  showFilter.value = false
}

function selectCategory(c: string) {
  selectedCategory.value = c
  currentPage.value = 1
}

function chooseSort(v: typeof sortBy.value) {
  sortBy.value = v
  showSort.value = false
  currentPage.value = 1
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

const heroTitle = computed(() => {
  if (selectedCategory.value === 'All') return 'Jewelry Collection'
  return `${selectedCategory.value} Collection`
})
</script>

<template>
  <section class="catalog">
    <StoreHeader />

    <!-- HERO (uses your CSS sw-hero / sw-hero__bg / sw-hero__content) -->
    <section class="sw-hero">
      <div class="sw-hero__bg"></div>

      <div class="sw-hero__content">
        <div class="sw-crumbs">
          <span class="sw-crumb">Home</span>
          <span class="sw-sep">/</span>
          <span class="sw-crumb">Jewelry</span>
          <span class="sw-sep">/</span>
          <span class="sw-crumb sw-crumb--active">
            {{ selectedCategory === 'All' ? 'Collection' : selectedCategory }}
          </span>
        </div>

        <h1 class="sw-hero__title">{{ heroTitle }}</h1>

        <p class="sw-hero__desc">
          Discover premium rings, necklaces, and earrings designed for everyday shine and special moments.
        </p>
      </div>
    </section>

    <!-- RESULTS FULL WIDTH -->
    <section class="sw-resultsFull">
      <div class="swbar">
        <div class="swbar__count">{{ totalResults }} Results</div>

        <div class="swbar__right">
          <button class="swbtn" type="button" @click="showFilter = true">
            <span class="swbtn__icon">⟂</span>
            Filters
          </button>

          <button class="swbtn" type="button" @click="showSort = true">
            <span class="swbtn__icon">⇅</span>
            Sort by
          </button>
        </div>
      </div>

      <!-- GRID -->
      <main class="results">
        <div class="grid sw-grid">
          <article v-for="p in pagedProducts" :key="p.id" class="sw-card">
            <button class="sw-heart" type="button" @click.stop="toggleWish(p)" aria-label="Wishlist">
              ♡
            </button>

            <div class="sw-img" role="button" tabindex="0" @click="openDetail(p)">
              <img :src="p.imageUrl" :alt="p.name" />
            </div>

            <div class="sw-info">
              <div class="sw-smallLine">
                <span v-if="p.badge" class="sw-badgeText" :class="p.badge === 'Sale' ? 'sale' : 'new'">
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

        <!-- PAGINATION (only shows if more than 20 results) -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="pagination-btn" type="button" :disabled="currentPage === 1" @click="prevPage">
            ‹ Prev
          </button>

          <button class="pagination-btn pagination-btn--active" type="button">
            Page {{ currentPage }} / {{ totalPages }}
          </button>

          <button class="pagination-btn" type="button" :disabled="currentPage === totalPages" @click="nextPage">
            Next ›
          </button>
        </div>
      </main>
    </section>

    <!-- SORT Drawer -->
    <div v-if="showSort" class="sw-overlay" @click="showSort = false"></div>
    <aside v-if="showSort" class="sw-drawer" role="dialog" aria-modal="true">
      <div class="sw-drawer__head">
        <div class="sw-drawer__title">Sort by</div>
        <button class="sw-x" type="button" @click="showSort = false">✕</button>
      </div>

      <div class="sw-drawer__body">
        <button class="sw-radio" type="button" @click="chooseSort('relevance')">
          Relevance <span class="sw-check" v-if="sortBy === 'relevance'">✓</span>
        </button>

        <button class="sw-radio" type="button" @click="chooseSort('new')">
          New In <span class="sw-check" v-if="sortBy === 'new'">✓</span>
        </button>

        <button class="sw-radio" type="button" @click="chooseSort('priceLow')">
          Price (lowest first) <span class="sw-check" v-if="sortBy === 'priceLow'">✓</span>
        </button>

        <button class="sw-radio" type="button" @click="chooseSort('priceHigh')">
          Price (highest first) <span class="sw-check" v-if="sortBy === 'priceHigh'">✓</span>
        </button>
      </div>

      <div class="sw-drawer__foot">
        <button class="sw-footBtn sw-footBtn--ghost" type="button" @click="showSort = false">Close</button>
        <button class="sw-footBtn" type="button" @click="showSort = false">Apply</button>
      </div>
    </aside>

    <!-- FILTER Drawer -->
    <div v-if="showFilter" class="sw-overlay" @click="showFilter = false"></div>
    <aside v-if="showFilter" class="sw-drawer" role="dialog" aria-modal="true">
      <div class="sw-drawer__head">
        <div class="sw-drawer__title">Filters</div>
        <button class="sw-x" type="button" @click="showFilter = false">✕</button>
      </div>

      <div class="sw-drawer__body">
        <div class="sw-row">
          <div class="sw-row__label">Available online</div>
          <button class="sw-toggle" :class="{ on: availableOnline }" type="button" @click="availableOnline = !availableOnline">
            <span class="sw-toggle__dot"></span>
          </button>
        </div>

        <div class="sw-sep2"></div>

        <div class="sw-secTitle">Category</div>
        <div class="sw-chipWrap">
          <button
            v-for="c in categories"
            :key="c"
            class="sw-chip"
            :class="{ active: selectedCategory === c }"
            type="button"
            @click="selectCategory(c)"
          >
            {{ c }}
          </button>
        </div>

        <div class="sw-sep2"></div>

        <div class="sw-secTitle">Price Range</div>
        <div class="sw-priceWrap">
          <div class="sw-price__field">
            <div class="sw-price__label">Min</div>
            <input class="sw-price__input" type="number" v-model.number="priceMin" placeholder="0" />
          </div>
          <div class="sw-price__field">
            <div class="sw-price__label">Max</div>
            <input class="sw-price__input" type="number" v-model.number="priceMax" placeholder="9999" />
          </div>
        </div>
      </div>

      <div class="sw-drawer__foot">
        <button class="sw-footBtn sw-footBtn--ghost" type="button" @click="resetAllFilters">Reset all</button>
        <button class="sw-footBtn" type="button" @click="applyFilters">Show {{ totalResults }} products</button>
      </div>
    </aside>
  </section>
</template>

<style scoped src="@/styles/user/catalog.css"></style>
