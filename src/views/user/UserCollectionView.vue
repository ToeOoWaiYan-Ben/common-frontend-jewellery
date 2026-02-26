<template>
  <div>
    <section class="hero" :style="heroStyle">
      <div class="hero__crumb">
        Home / Jewelry / <b>{{ heroTitle }}</b>
      </div>

      <h1 class="hero__title">{{ heroTitle }}</h1>
      <p class="hero__desc">{{ heroDesc }}</p>
    </section>

    <!-- your product list section stays below -->
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useUserJewelryTypesStore } from '@/stores/useUserJewelryTypesStore'

  const route = useRoute()
  const typesStore = useUserJewelryTypesStore()

  const typeId = computed(() => Number(route.query.typeId || 0))

  onMounted(async () => {
    if (typesStore.items.length === 0) {
      await typesStore.loadAll()
    }
  })

  const selectedType = computed(() => {
    return typesStore.items.find((t) => t.id === typeId.value) || null
  })

  const heroTitle = computed(() => selectedType.value?.name ?? 'Jewelry Collection')
  const heroDesc = computed(
    () => selectedType.value?.description ?? 'Discover premium jewelry for everyday shine.'
  )
  const heroImage = computed(() => selectedType.value?.imageUrl ?? '')

  const heroStyle = computed(() => {
    return heroImage.value
      ? {
          backgroundImage: `url(${heroImage.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}
  })
</script>

<style scoped>
  .hero {
    padding: 48px 64px;
    min-height: 360px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #f3f3f3;
  }
  .hero__crumb {
    margin-bottom: 12px;
  }
  .hero__title {
    font-size: 56px;
    margin: 0;
  }
  .hero__desc {
    max-width: 520px;
    opacity: 0.85;
  }
</style>
