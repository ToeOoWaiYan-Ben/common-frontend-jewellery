<template>
  <div class="settings-page">
    <h1 class="settings-title">Products</h1>
    <p class="settings-sub">Choose what to manage</p>

    <div class="grid">
      <RouterLink to="/admin/products" class="card">
        <h3>Products</h3>
        <p>Manage products</p>
      </RouterLink>

      <RouterLink to="/admin/categories" class="card">
        <h3>Categories</h3>
        <p>Manage categories</p>
      </RouterLink>

      <RouterLink to="/admin/gem-type-form" class="card">
        <h3>Gem Types</h3>
        <p>Manage gem types</p>
      </RouterLink>

      <RouterLink to="/admin/jewelry-types" class="card">
        <h3>Materials</h3>
        <p>Manage materials</p>
      </RouterLink>

      <RouterLink to="/admin/crafts" class="card">
        <h3>Crafts</h3>
        <p>Manage crafts</p>
      </RouterLink>

      <RouterLink to="/admin/product-tags" class="card">
        <h3>Product Tags</h3>
        <p>Manage product tags</p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped src="@/assets/styles/select.css"></style>
