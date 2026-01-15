<!-- src/views/user/CatalogView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StoreHeader from '@/components/user/StoreHeader.vue'

type Product = {
  id: number
  name: string
  price: number
  imageUrl: string
  badge?: 'New' | 'Sale'
  category?: string
  subtitle?: string
}

const router = useRouter()
const route = useRoute()

/* ---------- Demo data (replace with API later) ---------- */
const img1 =
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=60'
const img2 =
  'https://images.unsplash.com/photo-1601121141461-9d6644b2925b?auto=format&fit=crop&w=1200&q=60'
const img3 =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=60'
const img4 =
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=60'
const img5 =
  'https://images.unsplash.com/photo-1600721391689-2564bb8055de?auto=format&fit=crop&w=1200&q=60'
const img6 =
  'https://images.unsplash.com/photo-1543295204-2ae345412549?auto=format&fit=crop&w=1200&q=60'

const allProducts = ref<Product[]>([
  {
    id: 1,
    name: 'Idyllia motif ring',
    subtitle: 'Mixed cuts, Heart, Pink',
    price: 820,
    badge: 'New',
    category: 'Rings',
    imageUrl: img1,
  },
  {
    id: 2,
    name: 'Hyperbola ring',
    subtitle: 'Round cut, White',
    price: 650,
    badge: 'Sale',
    category: 'Rings',
    imageUrl: img2,
  },
  {
    id: 3,
    name: 'Stilla cocktail ring',
    subtitle: 'Round cut, Pavé',
    price: 490,
    badge: 'Sale',
    category: 'Rings',
    imageUrl: img3,
  },
  {
    id: 4,
    name: 'Matrix ring',
    subtitle: 'Baguette cut, Blue',
    price: 390,
    badge: 'Sale',
    category: 'Rings',
    imageUrl: img4,
  },
  {
    id: 5,
    name: 'Constella necklace',
    subtitle: 'Crystal, Silver tone',
    price: 1290,
    badge: 'New',
    category: 'Necklaces',
    imageUrl: img5,
  },
  {
    id: 6,
    name: 'Sparkling earrings',
    subtitle: 'Stud earrings, White',
    price: 560,
    category: 'Earrings',
    imageUrl: img6,
  },
])

/* ---------- UI state ---------- */
const loading = ref(false)
const error = ref('')

const sortBy = ref<'relevance' | 'new' | 'priceLow' | 'priceHigh'>('relevance')
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const selectedCategory = ref<string>('All')

/* ---------- Pagination ---------- */
const pageSize = ref(9)
const currentPage = ref(1)

/* ---------- Categories ---------- */
const categories = computed(() => {
  const set = new Set(allProducts.value.map((p) => p.category ?? 'Other'))
  return ['All', ...Array.from(set)]
})

/* ---------- Query category from header mega menu ---------- */
function applyCategoryFromQuery() {
  const q = route.query.category
  if (typeof q === 'string' && q.trim()) selectedCategory.value = q
  else selectedCategory.value = 'All'
}

/* ✅ FIX: use function (no multiline @click expression) */
function selectCategory(c: string) {
  selectedCategory.value = c
  currentPage.value = 1
}

watch(
  () => route.query.category,
  () => {
    applyCategoryFromQuery()
    currentPage.value = 1
  }
)

/* ---------- Filtering + sorting ---------- */
const filteredProducts = computed(() => {
  let items = [...allProducts.value]

  // category
  if (selectedCategory.value !== 'All') {
    items = items.filter((p) => (p.category ?? 'Other') === selectedCategory.value)
  }

  // price range
  if (priceMin.value != null && !Number.isNaN(priceMin.value)) {
    items = items.filter((p) => p.price >= Number(priceMin.value))
  }
  if (priceMax.value != null && !Number.isNaN(priceMax.value)) {
    items = items.filter((p) => p.price <= Number(priceMax.value))
  }

  // sort
  if (sortBy.value === 'priceLow') items.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'priceHigh') items.sort((a, b) => b.price - a.price)

  if (sortBy.value === 'new') {
    items.sort((a, b) => Number(b.badge === 'New') - Number(a.badge === 'New'))
  }

  return items
})

const totalFiltered = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / pageSize.value)))

const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

watch([selectedCategory, priceMin, priceMax, sortBy, pageSize], () => {
  currentPage.value = 1
})

/* ---------- Actions ---------- */
function formatPrice(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

function openDetail(p: Product) {
  router.push(`/user/product/${p.id}`)
}

function toggleWish(p: Product) {
  alert(`Wishlist ♡: ${p.name}`)
}

function applyFilters() {
  currentPage.value = 1
}

function resetFilters() {
  selectedCategory.value = 'All'
  priceMin.value = null
  priceMax.value = null
  sortBy.value = 'relevance'
  currentPage.value = 1
  router.replace({ path: '/user/catalog', query: {} })
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ---------- Fake load (for later API use) ---------- */
async function loadProducts() {
  try {
    loading.value = true
    error.value = ''
    // later: const res = await http.get('/products')
    // allProducts.value = res.data
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load products'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  applyCategoryFromQuery()
  loadProducts()
})
</script>

<template>
  <section class="catalog">
    <StoreHeader />

    <!-- hero -->
    <div class="catalog-hero">
      <div class="catalog-hero__overlay">
        <p class="catalog-hero__kicker">MYIT THAR OO</p>
        <h1 class="catalog-hero__title">Jewelry Collection</h1>
        <p class="catalog-hero__subtitle">
          Discover premium rings, necklaces, and earrings designed for everyday shine.
        </p>

        <button class="hero-btn" type="button" @click="resetFilters">Shop all</button>
      </div>
    </div>

    <div class="catalog-body">
      <!-- left: filters -->
      <aside class="filters">
        <div class="filters__card">
          <h3 class="filters__title">Filters</h3>

          <div class="filters__row">
            <div class="filters__label">Min</div>
            <input v-model.number="priceMin" class="filters__input" type="number" placeholder="0" min="0" />
          </div>

          <div class="filters__row">
            <div class="filters__label">Max</div>
            <input v-model.number="priceMax" class="filters__input" type="number" placeholder="9999" min="0" />
          </div>

          <button class="filters__btn" type="button" @click="applyFilters">Apply</button>
          <button class="filters__btn filters__btn--muted" type="button" @click="resetFilters">
            Reset
          </button>
        </div>

        <div class="filters__card">
          <h3 class="filters__title">Category</h3>

          <div class="filters__chips">
            <button
              v-for="c in categories"
              :key="c"
              class="chip"
              :class="{ 'chip--active': selectedCategory === c }"
              type="button"
              @click="selectCategory(c)"
            >
              {{ c }}
            </button>
          </div>
        </div>
      </aside>

      <!-- right: results -->
      <main class="results">
        <div class="toolbar">
          <div class="toolbar__left">
            <button class="icon-btn" type="button" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
              ‹
            </button>

            <button class="icon-btn" type="button" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">
              ›
            </button>

            <div class="toolbar__meta">
              Showing <strong>{{ pagedProducts.length }}</strong> of <strong>{{ totalFiltered }}</strong>
            </div>
          </div>

          <div class="toolbar__right">
            <span class="toolbar__label">Sort</span>
            <select v-model="sortBy" class="toolbar__select">
              <option value="relevance">Relevance</option>
              <option value="new">New</option>
              <option value="priceLow">Price: Low → High</option>
              <option value="priceHigh">Price: High → Low</option>
            </select>
          </div>
        </div>

        <div v-if="error" class="users-empty">{{ error }}</div>
        <div v-else-if="loading" class="users-empty">Loading products…</div>

        <template v-else>
          <div class="grid">
            <article v-for="p in pagedProducts" :key="p.id" class="card">
              <div class="card__img" role="button" tabindex="0" @click="openDetail(p)">
                <img :src="p.imageUrl" :alt="p.name" />
                <span v-if="p.badge" class="badge">{{ p.badge }}</span>
              </div>

              <div class="card__body">
                <h3 class="card__name">{{ p.name }}</h3>
                <p class="card__price">{{ formatPrice(p.price) }}</p>

                <div class="card__meta">
                  <span class="meta-pill">{{ p.category }}</span>
                  <span v-if="p.subtitle" class="meta-pill meta-pill--muted">{{ p.subtitle }}</span>
                </div>

                <div class="card__actions">
                  <button class="small-btn" type="button" @click="openDetail(p)">View</button>
                  <button class="small-btn small-btn--ghost" type="button" @click="toggleWish(p)">♡</button>
                </div>
              </div>
            </article>
          </div>

          <div class="pagination" v-if="totalPages > 1">
            <button class="pagination-btn" type="button" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">
              Prev
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              class="pagination-btn"
              :class="{ 'pagination-btn--active': page === currentPage }"
              type="button"
              @click="goPage(page)"
            >
              {{ page }}
            </button>

            <button class="pagination-btn" type="button" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">
              Next
            </button>
          </div>
        </template>
      </main>
    </div>
  </section>
</template>

<style scoped src="@/styles/user/catalog.css"></style>
