<template>
  <section class="p-4">
    <h2 class="text-xl font-bold mb-3">Images Upload</h2>

    <div v-if="store.error" class="p-2 mb-3 bg-red-100 text-red-700 rounded">
      {{ store.error }}
    </div>

    <div class="flex gap-2 items-center mb-4">
      <input type="file" accept="image/*" @change="onPick" />
      <button
        class="px-4 py-2 rounded bg-black text-white"
        :disabled="store.loading || !picked"
        @click="onUpload"
      >
        {{ store.loading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>

    <div class="grid grid-cols-4 gap-3">
      <div v-for="img in store.items" :key="img.id" class="border rounded p-2">
        <img :src="img.url" class="w-full h-40 object-cover rounded" />
        <div class="text-xs mt-2 break-all">{{ img.url }}</div>
        <button
          class="mt-2 px-3 py-1 rounded bg-red-600 text-white text-sm"
          @click="store.remove(img.id)"
        >
          Delete
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useImagesStore } from '../stores/useImagesStore'

  const store = useImagesStore()
  const picked = ref<File | null>(null)

  onMounted(() => {
    store.loadAll()
  })

  function onPick(e: Event) {
    const files = (e.target as HTMLInputElement).files
    picked.value = files && files[0] ? files[0] : null
  }

  async function onUpload() {
    if (!picked.value) return
    await store.upload(picked.value)
    picked.value = null
  }
</script>
