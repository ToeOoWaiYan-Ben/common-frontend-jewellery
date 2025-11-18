<!-- src/views/HomeView.vue -->
<template>
  <section>
    <h2 class="page-title">Dashboard</h2>

    <div class="home-grid">
      <div class="card">
        <h3>Total Users</h3>
        <p class="home-metric">1,234</p>
      </div>
      <div class="card">
        <h3>Orders Today</h3>
        <p class="home-metric">56</p>
      </div>
      <div class="card">
        <h3>Revenue</h3>
        <p class="home-metric">$4,210</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
  .home-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .home-metric {
    margin: 0.5rem 0 0;
    font-size: 1.4rem;
    font-weight: 600;
  }
</style>
