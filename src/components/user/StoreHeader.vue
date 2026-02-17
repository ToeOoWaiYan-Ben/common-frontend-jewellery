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

      <!-- ✅ Jewelry dropdown (dynamic from DB) -->
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
          <!-- ✅ loading / error -->
          <div v-if="typesStore.loading" class="mh-mega__col">
            <div class="mh-mega__title">Loading…</div>
          </div>

          <div v-else-if="typesStore.error" class="mh-mega__col">
            <div class="mh-mega__title">Error</div>
            <div style="padding: 8px 0">{{ typesStore.error }}</div>
          </div>

          <!-- ✅ grouped columns -->
          <template v-else>
            <div v-for="(list, catName) in groupedTypes" :key="catName" class="mh-mega__col">
              <div class="mh-mega__title">{{ catName }}</div>

              <button
                v-for="t in list"
                :key="t.id"
                class="mh-mega__item"
                type="button"
                @click="goType(t.id)"
              >
                {{ t.name }}
              </button>
            </div>

            <!-- promo stays the same -->
            <div class="mh-mega__promo">
              <div>
                <div class="mh-mega__promoTitle">Sale</div>
                <div class="mh-mega__promoSub">Up to 40% off select styles*</div>
              </div>
              <div class="mh-mega__promoImg"></div>
            </div>
          </template>
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
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserJewelryTypesStore } from '@/stores/useUserJewelryTypesStore'

  const router = useRouter()
  const open = ref(false)
  const dropdownRef = ref<HTMLElement | null>(null)

  const typesStore = useUserJewelryTypesStore()

  function go(path: string) {
    router.push(path)
  }

  function goType(typeId: number) {
    typesStore.setActiveType(typeId)
    open.value = false
  }

  /* ✅ group jewelry types by categoryName (column titles) */
  const groupedTypes = computed(() => {
    const map: Record<string, any[]> = {}
    for (const t of typesStore.items) {
      const key = t.categoryName || 'Other'
      if (!map[key]) map[key] = []
      map[key].push(t)
    }

    // optional: sort items A-Z inside each group
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    })

    return map
  })

  /* ✅ Close only when clicking outside */
  function onDocClick(e: MouseEvent) {
    const el = dropdownRef.value
    const target = e.target as Node | null
    if (!el || !target) return
    if (!el.contains(target)) open.value = false
  }

  onMounted(async () => {
    await typesStore.loadAll()
    document.addEventListener('click', onDocClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
  })
</script>

<style scoped src="@/styles/user/store-header.css"></style>
