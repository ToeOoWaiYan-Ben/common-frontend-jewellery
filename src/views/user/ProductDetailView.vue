<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import StoreHeader from '@/components/user/StoreHeader.vue' // ✅ FIXED

  const router = useRouter()
  const route = useRoute()
  const category = computed(() => (route.query.category as string) || 'Jewelry')

  type Product = {
    id: number
    name: string
    price: number
    badge?: 'New' | 'Sale'
    subtitle?: string
    imageUrl: string
    gallery?: string[]
    description: string
    details: string[]
  }

  const productId = computed(() => Number(route.params.id))

  // ✅ Demo images (replace with API later)
  const img1 =
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=60'
  const img2 =
    'https://images.unsplash.com/photo-1601121141461-9d6644b2925b?auto=format&fit=crop&w=1200&q=60'
  const img3 =
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=60'
  const img4 =
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=60'

  const products: Product[] = [
    {
      id: 1,
      name: 'Idyllia motif ring',
      subtitle: 'Mixed cuts, Heart, Pink, Mixed metal finish',
      price: 820,
      badge: 'New',
      imageUrl: img1,
      gallery: [img1, img2, img3],
      description:
        'A refined everyday ring designed to shine in both casual and formal looks. The crystal setting catches light beautifully, giving a clean and premium finish that pairs easily with other pieces.',
      details: [
        'Material: Mixed metal finish',
        'Color: Pink / Silver tone',
        'Stone cut: Mixed cuts',
        'Style: Motif ring',
        'Care: Avoid water, perfume, and harsh chemicals',
      ],
    },
    {
      id: 2,
      name: 'Hyperbola ring',
      subtitle: 'Round cut, White, Rhodium plated',
      price: 650,
      badge: 'Sale',
      imageUrl: img2,
      gallery: [img2, img4, img3],
      description:
        'A sleek minimal ring with a modern sparkle. Its clean silhouette makes it perfect for stacking or wearing alone as a simple statement.',
      details: [
        'Material: Rhodium plated',
        'Color: White',
        'Stone cut: Round cut',
        'Style: Band ring',
        'Care: Store in a soft pouch after use',
      ],
    },
    {
      id: 3,
      name: 'Stilla cocktail ring',
      subtitle: 'Round cut, Pavé, White, Rhodium plated',
      price: 490,
      badge: 'Sale',
      imageUrl: img3,
      gallery: [img3, img2, img1],
      description:
        'A cocktail-style piece with pavé shine that looks premium on photos and in real life. Great for events, parties, and special occasions.',
      details: [
        'Material: Rhodium plated',
        'Color: White',
        'Stone cut: Round cut / Pavé',
        'Style: Cocktail ring',
        'Care: Wipe with dry soft cloth',
      ],
    },
    {
      id: 4,
      name: 'Matrix ring',
      subtitle: 'Baguette cut, Blue, Rhodium plated',
      price: 390,
      badge: 'Sale',
      imageUrl: img4,
      gallery: [img4, img3, img2],
      description:
        'A baguette-cut ring that delivers a crisp, modern sparkle. The blue tone adds a luxury accent while keeping the design clean.',
      details: [
        'Material: Rhodium plated',
        'Color: Blue',
        'Stone cut: Baguette cut',
        'Style: Statement band',
        'Care: Keep away from heat & humidity',
      ],
    },
  ]

  const product = computed(() => products.find((p) => p.id === productId.value))

  const activeImage = ref<string>('')
  const tab = ref<'desc' | 'details'>('desc')

  watch(
    product,
    (p) => {
      activeImage.value = p?.imageUrl ?? ''
      tab.value = 'desc'
    },
    { immediate: true }
  )

  function formatPrice(v: number) {
    return `฿${v.toLocaleString('en-US')}`
  }

  function backToCatalog() {
    const category = route.query.category as string | undefined

    router.push({
      path: '/user/catalog',
      query: category ? { category } : {},
    })
  }

  function selectImage(url: string) {
    activeImage.value = url
  }

  function addToCart() {
    alert('Added to cart ✅')
  }

  function addToWishlist() {
    alert('Added to wishlist ♡')
  }
</script>

<template>
  <section class="pd-page">
    <StoreHeader />

    <section v-if="product" class="pd-wrap">
      <div class="pd-breadcrumb">
        <div class="pd-container">
          <button class="pd-crumbLink" type="button" @click="backToCatalog">Home</button>
          <span class="pd-crumbSep">/</span>
          <button class="pd-crumbLink" type="button" @click="backToCatalog">Jewelry</button>
          <span class="pd-crumbSep">/</span>
          <span class="pd-crumbCurrent">{{ category }}</span>
          <button class="pd-crumbLink" type="button" @click="backToCatalog">Rings</button>
          <span class="pd-crumbSep">/</span>
          <span class="pd-crumbNow">{{ product.name }}</span>
        </div>
      </div>

      <div class="pd-container pd-main">
        <div class="pd-gallery">
          <div class="pd-thumbs">
            <button
              v-for="(g, idx) in product.gallery?.length ? product.gallery : [product.imageUrl]"
              :key="idx"
              class="pd-thumb"
              :class="{ active: activeImage === g }"
              type="button"
              @click="selectImage(g)"
            >
              <img :src="g" alt="" />
            </button>
          </div>

          <div class="pd-heroImg">
            <img :src="activeImage || product.imageUrl" :alt="product.name" />
          </div>
        </div>

        <div class="pd-info">
          <div class="pd-topline">
            <span
              v-if="product.badge"
              class="pd-badge"
              :class="product.badge === 'Sale' ? 'sale' : 'new'"
            >
              {{ product.badge }}
            </span>
          </div>

          <h1 class="pd-title">{{ product.name }}</h1>
          <p class="pd-sub">{{ product.subtitle }}</p>

          <div class="pd-priceRow">
            <div class="pd-price">{{ formatPrice(product.price) }}</div>
            <button class="pd-heart" type="button" @click="addToWishlist">♡</button>
          </div>

          <div class="pd-actions">
            <button class="pd-btn" type="button" @click="addToCart">Add to cart</button>
            <button class="pd-btn ghost" type="button" @click="backToCatalog">
              Back to catalog
            </button>
          </div>

          <div class="pd-tabs">
            <button
              class="pd-tab"
              :class="{ active: tab === 'desc' }"
              type="button"
              @click="tab = 'desc'"
            >
              Description
            </button>
            <button
              class="pd-tab"
              :class="{ active: tab === 'details' }"
              type="button"
              @click="tab = 'details'"
            >
              Details
            </button>
          </div>

          <div class="pd-panel" v-if="tab === 'desc'">
            <p class="pd-desc">{{ product.description }}</p>
          </div>

          <div class="pd-panel" v-else>
            <ul class="pd-list">
              <li v-for="(d, i) in product.details" :key="i">{{ d }}</li>
            </ul>
          </div>

          <div class="pd-note">Free standard shipping over ฿3,670 · MYIT THAR OO</div>
        </div>
      </div>
    </section>

    <section v-else class="pd-container pd-notfound">
      <h2>Product not found</h2>
      <button class="pd-btn" type="button" @click="backToCatalog">Back to catalog</button>
    </section>
  </section>
</template>

<style scoped src="@/styles/user/product-detail-myittharoo.css"></style>
