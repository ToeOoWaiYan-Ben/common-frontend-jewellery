<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import StoreHeader from '@/components/user/StoreHeader.vue'
  import axios from 'axios'
  import type { ProductImageDto } from '@/dtos/ProductImageDto'


  import type { ProductDto } from '@/types/ProductDto'
  /* -------- API state -------- */
const loading = ref(false)
const error = ref('')
const product = ref<ProductDto | null>(null)
  const detailsList = computed(() => {
  const p = product.value
  if (!p) return []

  const items: string[] = []

  // ✅ from ProductDto fields
  if (p.code) items.push(`Code: ${p.code}`)
  if (p.stockStatus) items.push(`Stock status: ${p.stockStatus}`)
  if (p.collection) items.push(`Collection: ${p.collection}`)
  if (p.color) items.push(`Color: ${p.color}`)
  if (p.weight != null) items.push(`Weight: ${p.weight}`)
  if (p.qty != null) items.push(`Available Qty: ${p.qty}`)

  // ✅ show gem info (optional)
  const firstJew = p.productJewellerys?.[0]
  if (firstJew?.unitWeight != null) items.push(`Unit weight: ${firstJew.unitWeight}`)
  if (firstJew?.originalPrice != null)
    items.push(`Original price: ${formatPrice(Number(firstJew.originalPrice))}`)

  // ✅ show gold info (optional)
  const firstGold = p.productGolds?.[0]
  if (firstGold?.goldPurity) items.push(`Gold purity: ${firstGold.goldPurity}`)
  if (firstGold?.goldSourceName) items.push(`Gold source: ${firstGold.goldSourceName}`)
  if (firstGold?.craftShopName) items.push(`Craft: ${firstGold.craftShopName}`)

  return items
})

  const router = useRouter()
  const route = useRoute()
  function getPrice(p: ProductDto) {
  return Number(p.productJewellerys?.[0]?.sellingPrice ?? 0)
}
function getSubtitle(p: ProductDto) {
  return p.shortDesc ?? ''
}
function getDescription(p: ProductDto) {
  return p.desc ?? ''
}

  const category = computed(() => (route.query.category as string) || 'Jewelry')
  const productId = computed(() => Number(route.params.id))
  async function fetchProduct() {
  loading.value = true
  error.value = ''
  product.value = null

  try {
    const { data } = await axios.get(`http://localhost:8080/api/products/${productId.value}`)
    product.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to load product.'
  } finally {
    loading.value = false
  }
}
onMounted(fetchProduct)
watch(productId, fetchProduct)
const galleryTop3 = computed(() => {
  const imgs = ((product.value?.productImages ?? []) as ProductImageDto[])
    .map((img) => img.imageUrl)
    .filter((u): u is string => Boolean(u))

  return imgs.slice(0, 3)
})

const activeImage = ref<string>('')

watch(
  galleryTop3,
  (imgs) => {
    activeImage.value = imgs[0] ?? '/default-product.jpg'
  },
  { immediate: true }
)

function selectImage(url: string) {
  activeImage.value = url
}
  

  /* -------- UI state -------- */
  
  const tab = ref<'desc' | 'details'>('desc')

  /* ✅ IMPORTANT:
   Your ProductDto does not show imageUrl/price in the interface you sent.
   So we provide safe mappers. Replace these with your REAL backend fields.
*/
  

function formatPrice(v: number) {
  return `${v.toLocaleString('en-US')} MMK`
}

  function backToCatalog() {
    // keep typeId so when user goes back, it still shows that type products
    const query: any = {}
    if (route.query.category) query.category = route.query.category
    if (route.query.typeId) query.typeId = route.query.typeId

    router.push({
      path: '/user/catalog',
      query,
    })
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

    <!-- Loading -->
    <section v-if="loading" class="pd-container pd-notfound">
      <h2>Loading...</h2>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="pd-container pd-notfound">
      <h2>{{ error }}</h2>
      <button class="pd-btn" type="button" @click="backToCatalog">Back to catalog</button>
    </section>

    <section v-else-if="product" class="pd-wrap">
  <div class="pd-breadcrumb">
    <div class="pd-container">
      <button class="pd-crumbLink" type="button" @click="backToCatalog">Home</button>
      <span class="pd-crumbSep">/</span>
      <button class="pd-crumbLink" type="button" @click="backToCatalog">Jewelry</button>
      <span class="pd-crumbSep">/</span>
      <span class="pd-crumbCurrent">{{ category }}</span>
      <span class="pd-crumbSep">/</span>
      <span class="pd-crumbNow">{{ product.name }}</span>
    </div>
  </div>

  <div class="pd-container pd-main">
    <!-- Gallery -->
    <div class="pd-gallery">
      <!-- thumbs (max 3) -->
      <div class="pd-thumbs">
        <button
          v-for="(img, idx) in galleryTop3"
          :key="idx"
          class="pd-thumb"
          :class="{ active: activeImage === img }"
          type="button"
          @click="selectImage(img)"
          :title="`View photo ${idx + 1}`"
        >
          <img :src="img" :alt="`${product.name} photo ${idx + 1}`" />
        </button>

        <!-- if no images -->
        <div v-if="galleryTop3.length === 0" class="pd-thumb pd-thumb--empty">
          No photos
        </div>
      </div>

      <!-- big hero image -->
      <div class="pd-heroImg">
        <img :src="activeImage || '/default-product.jpg'" :alt="product.name" />
      </div>
    </div>

    <!-- Info -->
    <div class="pd-info">
      <h1 class="pd-title">{{ product.name }}</h1>
      <p class="pd-sub">{{ getSubtitle(product) }}</p>

      <div class="pd-priceRow">
        <div class="pd-price">{{ formatPrice(getPrice(product)) }}</div>
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

<!-- Description -->
<div class="pd-panel" v-if="tab === 'desc'">
  <p class="pd-desc">{{ getDescription(product) }}</p>
</div>

<!-- Details -->
<div class="pd-panel" v-else>
  <ul class="pd-list">
    <li v-for="(d, i) in detailsList" :key="i">{{ d }}</li>
  </ul>
</div>

<div class="pd-note"> MYIT THAR OO</div>

      <!-- (keep your tabs/panels below if you want) -->
    </div>
  </div>
</section>

    <!-- Not Found -->
    <section v-else class="pd-container pd-notfound">
      <h2>Product not found</h2>
      <button class="pd-btn" type="button" @click="backToCatalog">Back to catalog</button>
    </section>
  </section>
</template>

<style scoped src="@/styles/user/product-detail-myittharoo.css"></style>
