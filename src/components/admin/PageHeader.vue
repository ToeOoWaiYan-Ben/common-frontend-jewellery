<template>
  <section class="panel panel--filters tables-header">
    <div class="tables-header-left">
      <h1 class="tables-title">{{ title }}</h1>
      <p v-if="subtitle" class="tables-subtitle">{{ subtitle }}</p>
    </div>

    <div class="tables-header-right">
      <slot name="right"></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    subtitle?: string
  }>()
</script>
