<template>
    <section class="panel panel--filters">
      <div class="filters-row">
        <slot />
      </div>
    </section>
  </template>
  
  <script setup lang="ts"></script>
  
  <style scoped>
  .filters-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }
  </style>