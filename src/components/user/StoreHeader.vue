<template>
  <header class="mh-header">
    <!-- Top black bar -->

    <!-- Brand -->
    <div class="mh-brand">
      <div class="mh-brand__logo">MYIT TAR OO</div>
    </div>

    <!-- Nav -->
    <nav class="mh-nav">
      <!-- ✅ Jewelry dropdown (dynamic from DB) -->
      <div class="mh-nav__dropdown" ref="dropdownRef" @click.stop>
        <button
          class="mh-nav__link mh-nav__link--active"
          type="button"
          :aria-expanded="open"
          @click.stop="open = !open"
        >
          Jewelry Types
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
            <div class="mh-mega__promo"></div>
          </template>
        </div>
      </div>
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
    router.push({
      path: '/user/catalog',
      query: { typeId }, // example: ?typeId=3
    })
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
