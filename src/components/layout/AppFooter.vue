<template>
  <footer class="app-footer">
    <small>© {{ year }} My Admin Dashboard</small>
  </footer>
</template>

<script setup lang="ts">
  const year = new Date().getFullYear()
</script>
