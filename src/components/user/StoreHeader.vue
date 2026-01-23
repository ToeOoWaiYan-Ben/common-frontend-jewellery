<template>
  <header class="mh-header">
    <!-- Top black bar -->
    <div class="mh-topbar">
      <div class="mh-topbar__left">
        <span class="mh-topbar__item">Stores</span>
      </div>

      <div class="mh-topbar__center">
        <span class="mh-topbar__item">Free standard shipping over 3,670 ฿</span>
      </div>

      <div class="mh-topbar__right">
        <button class="mh-topbar__btn" type="button">Club</button>
        <button class="mh-topbar__btn" type="button">Login</button>
        <button class="mh-icon-btn" type="button" aria-label="Search">🔍</button>
        <button class="mh-icon-btn" type="button" aria-label="Bag">👜</button>
      </div>
    </div>

    <!-- Brand -->
    <div class="mh-brand">
      <div class="mh-brand__logo">MYIT THAR OO</div>
    </div>

    <!-- Nav -->
    <nav class="mh-nav">
      <button class="mh-nav__link" type="button" @click="go('/user/home')">Home</button>
      <button class="mh-nav__link" type="button">SALE</button>
      <button class="mh-nav__link" type="button">New In</button>

      <!-- ✅ Jewelry dropdown (fixed: click open + click outside close) -->
      <div class="mh-nav__dropdown" ref="dropdownRef" @click.stop>
        <button
          class="mh-nav__link mh-nav__link--active"
          type="button"
          :aria-expanded="open"
          @click.stop="open = !open"
        >
          Jewelry
        </button>

        <div v-if="open" class="mh-mega" @click.stop>
          <div class="mh-mega__col">
            <div class="mh-mega__title">Necklaces and pendants</div>
            <button class="mh-mega__item" type="button" @click="goCategory('Necklaces')">
              Necklaces
            </button>
            <button class="mh-mega__item" type="button" @click="goCategory('Pendants')">
              Pendants
            </button>
            <button class="mh-mega__item" type="button" @click="goCategory('Chokers')">
              Chokers
            </button>
          </div>

          <div class="mh-mega__col">
            <div class="mh-mega__title">Earrings</div>
            <button class="mh-mega__item" type="button" @click="goCategory('Earrings')">
              Earrings
            </button>
            <button class="mh-mega__item" type="button" @click="goCategory('Stud earrings')">
              Stud earrings
            </button>
            <button class="mh-mega__item" type="button" @click="goCategory('Hoop earrings')">
              Hoop earrings
            </button>
          </div>

          <div class="mh-mega__col">
            <div class="mh-mega__title">Rings</div>
            <button class="mh-mega__item" type="button" @click="goCategory('Rings')">Rings</button>
            <button class="mh-mega__item" type="button" @click="goCategory('Band rings')">
              Band rings
            </button>
            <button class="mh-mega__item" type="button" @click="goCategory('Stackable rings')">
              Stackable rings
            </button>
          </div>

          <div class="mh-mega__promo">
            <div>
              <div class="mh-mega__promoTitle">Sale</div>
              <div class="mh-mega__promoSub">Up to 40% off select styles*</div>
            </div>
            <div class="mh-mega__promoImg"></div>
          </div>
        </div>
      </div>

      <button class="mh-nav__link" type="button">Watches</button>
      <button class="mh-nav__link" type="button">Accessories</button>
      <button class="mh-nav__link" type="button">Decorations</button>
      <button class="mh-nav__link" type="button">Gifts</button>
      <button class="mh-nav__link" type="button">World of Myit Thar Oo</button>

      <button class="mh-nav__icon" type="button" aria-label="Search">🔍</button>
      <button class="mh-nav__icon" type="button" aria-label="Bag">👜</button>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const open = ref(false)
  const dropdownRef = ref<HTMLElement | null>(null)

  function go(path: string) {
    router.push(path)
  }

  function goCategory(category: string) {
    router.push({ path: '/user/catalog', query: { category } })
    open.value = false
  }

  /* ✅ Close only when clicking outside */
  function onDocClick(e: MouseEvent) {
    const el = dropdownRef.value
    const target = e.target as Node | null
    if (!el || !target) return
    if (!el.contains(target)) open.value = false
  }

  onMounted(() => document.addEventListener('click', onDocClick))
  onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped src="@/styles/user/store-header.css"></style>
