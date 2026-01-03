<template>
  <section class="detail">
    <!-- HEADER (same as catalog) -->
    <header class="store-header">
      <div class="store-top">
        <div class="store-top__left">
          <div class="store-top__item">
            <span class="store-top__label">Location</span>
            <span class="store-top__value">29 Street Yangon-Myanmar</span>
          </div>

          <div class="store-top__divider"></div>

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
        <button class="store-nav__link" type="button" @click="goTo('/user/catalog')">HOME</button>
        <button class="store-nav__link" type="button">CONTACT</button>
        <button class="store-nav__link" type="button">ABOUT US</button>
        <button class="store-nav__link store-nav__link--active" type="button">
          JEWELRY
        </button>
      </nav>
    </header>

    <!-- HERO -->
    <section class="detail-hero">
      <div class="detail-hero__overlay">
        <p class="detail-hero__kicker">JEWELLERY</p>
        <h1 class="detail-hero__title">Detail Page</h1>
        <p class="detail-hero__subtitle">by MYT TAR OO</p>
      </div>
    </section>

    <!-- CONTENT -->
    <div class="detail-wrap">
      <div class="detail-panel">
        <div class="detail-head">
          <h2 class="detail-head__title">DETAIL LIST</h2>
          <div class="detail-head__line"></div>
        </div>

        <div v-if="!product" class="not-found">
          Product not found.
          <button class="ghost-btn" type="button" @click="goBack" style="margin-left: 10px">
            Back
          </button>
        </div>

        <div v-else class="detail-grid">
          <!-- Thumbnails -->
          <aside class="thumbs">
            <button
              v-for="img in product.images"
              :key="img"
              class="thumb"
              :class="{ 'thumb--active': img === selectedImage }"
              type="button"
              @click="selectedImage = img"
              :aria-label="`Select image`"
            >
              <img :src="img" :alt="`${product.name} thumbnail`" />
            </button>
          </aside>

          <!-- Main image -->
          <div class="main-img">
            <img :src="selectedImage" :alt="product.name" />
          </div>

          <!-- Right info -->
          <section class="info">
            <div class="info-top">
              <h2 class="info-title">{{ product.name }}</h2>
              <button class="info-heart" type="button" aria-label="wishlist">♡</button>
            </div>

            <a class="info-link" href="javascript:void(0)">
              {{ product.shortDesc }}
            </a>

            <div class="info-price">
              <div class="price">MMK {{ product.price.toLocaleString() }}</div>
              <div class="tax">Including Taxes</div>
            </div>

            <div class="info-actions">
              <button class="primary-btn" type="button">
                Add to Cart
              </button>
              <button class="ghost-btn" type="button" @click="goBack">
                Back
              </button>
            </div>

            <!-- ✅ Description + Details UNDER buttons -->
            <div class="bottom">
              <div class="desc">
                <h3 class="bottom-title">Description</h3>
                <p class="desc-paragraph">
                  {{ product.description }}
                </p>
              </div>

              <div class="meta">
                <h3 class="bottom-title">Details</h3>
                <ul class="meta-list">
                  <li class="meta-row">
                    <span class="meta-label">Ref.</span>
                    <span class="meta-value">{{ product.ref }}</span>
                  </li>
                  <li class="meta-row">
                    <span class="meta-label">Material</span>
                    <span class="meta-value">{{ product.material }}</span>
                  </li>
                  <li class="meta-row">
                    <span class="meta-label">Gemstone</span>
                    <span class="meta-value">{{ product.gemstone }}</span>
                  </li>
                  <li class="meta-row">
                    <span class="meta-label">Pendant Height</span>
                    <span class="meta-value">{{ product.pendantHeight }}</span>
                  </li>
                  <li class="meta-row">
                    <span class="meta-label">Chain length</span>
                    <span class="meta-value">{{ product.chainLength }}</span>
                  </li>
                  <li class="meta-row">
                    <span class="meta-label">Made In</span>
                    <span class="meta-value">{{ product.madeIn }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  type Product = {
    id: number
    name: string
    shortDesc: string
    description: string
    price: number
    images: string[]
    ref: string
    material: string
    gemstone: string
    pendantHeight: string
    chainLength: string
    madeIn: string
  }

  const router = useRouter()
  const route = useRoute()

  function goBack() {
    router.back()
  }
  function goTo(path: string) {
    router.push(path)
  }

  // ✅ Frontend-only demo data (no backend)
  const products: Product[] = [
    {
      id: 1,
      name: 'B.ZERO1 NECKLACE',
      shortDesc: 'B.zero1 18 kt yellow gold mini pendant | necklace with chain',
      description:
        "Drawing its inspiration from the world’s most renowned amphitheatre, the Colosseum, the B.zero1 18 kt yellow gold chain necklace is a groundbreaking statement of Bulgari’s daring creative vision. The purity of its famed spiral, rendered through the powerful lines of the mini pendant in 18 kt yellow gold, is the emblem of the collection’s audacious essence and innovative spirit.",
      price: 80000000,
      images: [
        'https://images.unsplash.com/photo-1601121141461-9d664ddc2c8b?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1601121141458-246b5b3c7f5f?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60',
      ],
      ref: '359730',
      material: 'Yellow gold',
      gemstone: 'No Gemstones',
      pendantHeight: '0.8 cm',
      chainLength: '38 - 41.5 - 45CM',
      madeIn: 'Italy',
    },
    {
      id: 2,
      name: 'Flash Furniture Necklace',
      shortDesc: 'Flash Furniture | necklace',
      description:
        'A clean, modern necklace designed for everyday wear. Balanced proportions and a simple silhouette make it versatile for layering.',
      price: 650000,
      images: [
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1601121141458-246b5b3c7f5f?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60',
      ],
      ref: 'FF-102',
      material: 'Silver',
      gemstone: 'No Gemstones',
      pendantHeight: '1.0 cm',
      chainLength: '40 - 45CM',
      madeIn: 'Myanmar',
    },
    {
      id: 3,
      name: 'Silver Pearl Bracelet',
      shortDesc: 'Silver Pearl | bracelet',
      description:
        'Elegant bracelet with pearl tone detail and a clean silver finish, perfect for formal looks. Comfortable fit and refined shine.',
      price: 490000,
      images: [
        'https://images.unsplash.com/photo-1602752250015-7f81f62f4a50?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1601121141461-9d664ddc2c8b?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=60',
      ],
      ref: 'SP-104',
      material: 'Silver',
      gemstone: 'Pearl',
      pendantHeight: '-',
      chainLength: '16 - 18CM',
      madeIn: 'Myanmar',
    },
  ]

  const productId = computed(() => Number(route.params.id))
  const product = computed(() => products.find((p) => p.id === productId.value))

  const selectedImage = ref<string>('')

  watch(
    product,
    (p) => {
      selectedImage.value = p?.images?.[0] ?? ''
    },
    { immediate: true }
  )
</script>

<style scoped src="@/styles/user/product-detail.css"></style>
