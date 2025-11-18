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
  import HeaderBar from './components/layout/HeaderBar.vue'
  import SideNav from './components/layout/SideNav.vue'
  import AppFooter from './components/layout/AppFooter.vue'
</script>
