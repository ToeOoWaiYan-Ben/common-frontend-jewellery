<template>
  <section class="catalog">
    <!-- HEADER -->
    <header class="store-header">
      <div class="store-top">
        <div class="store-top__left">
          <div class="store-top__item">
            <span class="store-top__label">Location</span>
            <span class="store-top__value">29 Street Yangon-Myanmar</span>
          </div>
          <div class="store-top__divider" />
          <div class="store-top__item">
            <span class="store-top__label">Phone</span>
            <span class="store-top__value">09-644-324-523</span>
          </div>
        </div>

        <div class="store-top__center">
          <div class="store-logo">
            <span class="store-logo__icon"></span>
            <span class="store-logo__text">MYIT TAR OO</span>
          </div>
        </div>

        <div class="store-top__right">
          <button class="wishlist" type="button">
            <span class="wishlist__icon">♡</span>
            <span>My Wishlist (0)</span>
          </button>
        </div>
      </div>

      <nav class="store-nav">
        <button class="store-nav__link" type="button">HOME</button>
        <button class="store-nav__link" type="button">CONTACT</button>
        <button class="store-nav__link" type="button">ABOUT US</button>
        <button class="store-nav__link store-nav__link--active" type="button">JEWELRY</button>
      </nav>
    </header>

    <!-- HERO -->
    <div class="catalog-hero">
      <div class="catalog-hero__overlay">
        <p class="catalog-hero__kicker">JEWELLERY</p>
        <h1 class="catalog-hero__title">The latest collections</h1>
        <p class="catalog-hero__subtitle">by MYT TAR OO</p>
        <button class="hero-btn" type="button">SHOP NOW</button>
      </div>
    </div>

    <!-- BODY -->
    <div class="catalog-body">
      <!-- LEFT FILTERS -->
      <aside class="filters">
        <!-- PRICE -->
        <div class="filters__card">
          <h3 class="filters__title">PRICE</h3>

          <div class="filters__row">
            <label class="filters__label">Min</label>
            <input v-model.number="filters.minPrice" class="filters__input" type="number" min="0" />
          </div>

          <div class="filters__row">
            <label class="filters__label">Max</label>
            <input v-model.number="filters.maxPrice" class="filters__input" type="number" min="0" />
          </div>

          <button class="filters__btn" type="button" @click="applyFilters">Apply</button>
        </div>

        <!-- SIZE -->
        <div class="filters__card">
          <h3 class="filters__title">SIZE</h3>
          <div class="filters__chips">
            <button
              v-for="s in sizeOptions"
              :key="s"
              type="button"
              class="chip"
              :class="{ 'chip--active': filters.size === s }"
              @click="filters.size = filters.size === s ? null : s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- TYPES (Accordion) -->
        <div class="filters__card">
          <h3 class="filters__title">TYPES</h3>

          <div class="accordion">
            <div
              v-for="t in typeOptions"
              :key="t"
              class="acc-item"
              :class="{ 'acc-item--open': openType === t }"
            >
              <button class="acc-header" type="button" @click="toggleType(t)">
                <span class="acc-title">{{ t }}</span>
                <span class="acc-chev" :class="{ 'acc-chev--open': openType === t }">⌄</span>
              </button>

              <div v-if="openType === t" class="acc-body">
                <label class="acc-option">
                  <input type="checkbox" :value="t" v-model="filters.types" />
                  <span>Include {{ t }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- CATEGORIES (Accordion) -->
        <div class="filters__card">
          <h3 class="filters__title">CATEGORIES</h3>

          <div class="accordion">
            <div
              v-for="group in categoryGroups"
              :key="group.key"
              class="acc-item"
              :class="{ 'acc-item--open': openCategory === group.key }"
            >
              <button class="acc-header" type="button" @click="toggleCategory(group.key)">
                <span class="acc-title">{{ group.label }}</span>
                <span class="acc-chev" :class="{ 'acc-chev--open': openCategory === group.key }"
                  >⌄</span
                >
              </button>

              <div v-if="openCategory === group.key" class="acc-body">
                <label v-for="opt in group.options" :key="opt" class="acc-option">
                  <input type="checkbox" :value="opt" v-model="filters.categories" />
                  <span>{{ opt }}</span>
                </label>
              </div>
            </div>
          </div>

          <button class="filters__btn filters__btn--muted" type="button" @click="resetFilters">
            Reset
          </button>
        </div>
      </aside>

      <!-- RIGHT RESULTS -->
      <main class="results">
        <!-- toolbar -->
        <div class="toolbar">
          <div class="toolbar__left">
            <button class="icon-btn" type="button" aria-label="Grid view">▦</button>
            <button class="icon-btn" type="button" aria-label="List view" disabled>≡</button>

            <span class="toolbar__meta">
              Showing {{ pagedProducts.length }} of {{ filteredProducts.length }} items
            </span>
          </div>

          <div class="toolbar__right">
            <label class="toolbar__label">Sort By:</label>
            <select v-model="sortBy" class="toolbar__select">
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
            </select>
          </div>
        </div>

        <!-- grid -->
        <div class="grid">
          <article v-for="p in pagedProducts" :key="p.id" class="card">
            <div class="card__img">
              <img :src="p.imageUrl" :alt="p.name" />
              <span v-if="p.badge" class="badge">{{ p.badge }}</span>
            </div>

            <div class="card__body">
              <h4 class="card__name">{{ p.name }}</h4>
              <p class="card__price">฿{{ formatPrice(p.price) }}</p>

              <div class="card__meta">
                <span class="meta-pill">{{ p.type }}</span>
                <span class="meta-pill meta-pill--muted">{{ p.category }}</span>
              </div>

              <div class="card__actions">
                <!-- ✅ IMPORTANT: go to detail of clicked item -->
                <button class="small-btn" type="button" @click="goDetail(p.id)">Add to Cart</button>

                <button class="small-btn small-btn--ghost" type="button">♡</button>
              </div>
            </div>
          </article>
        </div>

        <!-- pagination -->
        <div class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            ‹ Prev
          </button>

          <button
            v-for="page in pageNumbers"
            :key="page"
            class="pagination-btn"
            :class="{ 'pagination-btn--active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Next ›
          </button>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  function goDetail(id: number) {
    router.push(`/user/product/${id}`)
  }

  type Product = {
    id: number
    name: string
    price: number
    type: 'Necklaces' | 'Earrings' | 'Bracelet' | 'Rings'
    category: 'New Arrival' | 'Trending' | 'Best Seller'
    size: 'XS' | 'S' | 'M' | 'L'
    imageUrl: string
    badge?: 'SALE' | 'NEW'
    createdAt: string
  }

  // mock images
  const img1 =
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=60'
  const img2 =
    'https://images.unsplash.com/photo-1601121141461-9d6644b2925b?auto=format&fit=crop&w=900&q=60'
  const img3 =
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=60'
  const img4 =
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=60'

  const products = ref<Product[]>([
    {
      id: 1,
      name: 'Global Knives – Gold Ring',
      price: 820,
      type: 'Rings',
      category: 'Trending',
      size: 'M',
      imageUrl: img1,
      badge: 'SALE',
      createdAt: '2025-12-01',
    },
    {
      id: 2,
      name: 'Flash Furniture Necklace',
      price: 650,
      type: 'Necklaces',
      category: 'New Arrival',
      size: 'S',
      imageUrl: img2,
      badge: 'NEW',
      createdAt: '2025-12-20',
    },
    {
      id: 3,
      name: 'Silver Pearl Bracelet',
      price: 490,
      type: 'Bracelet',
      category: 'Best Seller',
      size: 'L',
      imageUrl: img3,
      createdAt: '2025-11-15',
    },
    {
      id: 4,
      name: 'Crystal Earrings Set',
      price: 390,
      type: 'Earrings',
      category: 'Trending',
      size: 'XS',
      imageUrl: img4,
      createdAt: '2025-10-01',
    },

    {
      id: 5,
      name: 'Rose Gold Ring Classic',
      price: 910,
      type: 'Rings',
      category: 'New Arrival',
      size: 'S',
      imageUrl: img1,
      createdAt: '2025-12-25',
    },
    {
      id: 6,
      name: 'Necklace – Minimal Charm',
      price: 520,
      type: 'Necklaces',
      category: 'Best Seller',
      size: 'M',
      imageUrl: img2,
      createdAt: '2025-09-01',
    },
    {
      id: 7,
      name: 'Earrings – Diamond Drop',
      price: 740,
      type: 'Earrings',
      category: 'New Arrival',
      size: 'XS',
      imageUrl: img4,
      badge: 'NEW',
      createdAt: '2025-12-22',
    },
    {
      id: 8,
      name: 'Bracelet – Gold Twist',
      price: 610,
      type: 'Bracelet',
      category: 'Trending',
      size: 'L',
      imageUrl: img3,
      badge: 'SALE',
      createdAt: '2025-08-10',
    },

    {
      id: 9,
      name: 'Rings – Twin Stone',
      price: 880,
      type: 'Rings',
      category: 'Best Seller',
      size: 'M',
      imageUrl: img1,
      createdAt: '2025-06-01',
    },
    {
      id: 10,
      name: 'Necklaces – Pearl Line',
      price: 560,
      type: 'Necklaces',
      category: 'Trending',
      size: 'S',
      imageUrl: img2,
      createdAt: '2025-05-01',
    },
    {
      id: 11,
      name: 'Bracelet – Silver Chain',
      price: 420,
      type: 'Bracelet',
      category: 'New Arrival',
      size: 'XS',
      imageUrl: img3,
      badge: 'NEW',
      createdAt: '2025-12-10',
    },
    {
      id: 12,
      name: 'Earrings – Star Shine',
      price: 330,
      type: 'Earrings',
      category: 'Best Seller',
      size: 'L',
      imageUrl: img4,
      createdAt: '2025-03-01',
    },
  ])

  const sizeOptions: Array<Product['size']> = ['XS', 'S', 'M', 'L']
  const typeOptions: Array<Product['type']> = ['Necklaces', 'Earrings', 'Bracelet', 'Rings']

  type CategoryKey = 'necklaces' | 'earrings' | 'bracelet' | 'rings'
  const categoryGroups = [
    {
      key: 'necklaces' as const,
      label: 'Necklaces & Pendants',
      options: ['chains', 'chokers', 'lockets', 'pendants'],
    },
    { key: 'earrings' as const, label: 'Earrings', options: ['studs', 'hoops', 'drops'] },
    { key: 'bracelet' as const, label: 'Bracelet', options: ['bangles', 'charm', 'cuff'] },
    { key: 'rings' as const, label: 'Rings', options: ['engagement', 'stacking', 'classic'] },
  ] as const

  const filters = ref({
    minPrice: 0,
    maxPrice: 2000,
    size: null as Product['size'] | null,
    types: [] as Product['type'][],
    categories: [] as string[],
  })

  const sortBy = ref<'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc'>('relevance')

  const pageSize = ref(9)
  const currentPage = ref(1)

  const openType = ref<Product['type'] | null>('Necklaces')
  const openCategory = ref<CategoryKey | null>('necklaces')

  function toggleType(t: Product['type']) {
    openType.value = openType.value === t ? null : t
  }

  function toggleCategory(key: CategoryKey) {
    openCategory.value = openCategory.value === key ? null : key
  }

  const filteredProducts = computed(() => {
    return products.value.filter((p) => {
      if (p.price < filters.value.minPrice) return false
      if (p.price > filters.value.maxPrice) return false
      if (filters.value.size && p.size !== filters.value.size) return false
      if (filters.value.types.length && !filters.value.types.includes(p.type)) return false
      return true
    })
  })

  const sortedProducts = computed(() => {
    const items = [...filteredProducts.value]
    switch (sortBy.value) {
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price_asc':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        items.sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }
    return items
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(sortedProducts.value.length / pageSize.value))
  )

  const pagedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return sortedProducts.value.slice(start, start + pageSize.value)
  })

  const pageNumbers = computed(() => {
    const arr: number[] = []
    for (let i = 1; i <= totalPages.value; i++) arr.push(i)
    return arr
  })

  watch([filteredProducts, sortBy], () => {
    currentPage.value = 1
  })

  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  function applyFilters() {
    currentPage.value = 1
  }

  function resetFilters() {
    filters.value = { minPrice: 0, maxPrice: 2000, size: null, types: [], categories: [] }
    currentPage.value = 1
    openType.value = 'Necklaces'
    openCategory.value = 'necklaces'
  }

  function formatPrice(v: number) {
    return v.toLocaleString('en-US')
  }
</script>

<style scoped src="@/styles/user/catalog.css"></style>
