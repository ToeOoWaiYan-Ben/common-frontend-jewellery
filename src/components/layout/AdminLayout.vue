<!-- src/App.vue -->
<template>
  <div class="app-layout">
    <HeaderBar />

    <div class="app-main">
      <SideNav />

      <main class="app-content">
        <router-view />
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
  import HeaderBar from './HeaderBar.vue'
  import SideNav from './SideNav.vue'
  import AppFooter from './AppFooter.vue'
</script>
