<template>
  <div class="settings-page">
    <h1 class="settings-title">Pricing</h1>
    <p class="settings-sub">Choose what to manage</p>

    <div class="grid">
      <RouterLink to="/admin/gold-price-history" class="card">
        <h3>Gold Prices</h3>
        <p>Manage prices</p>
      </RouterLink>

      <RouterLink to="/admin/promotions" class="card">
        <h3>Promotions</h3>
        <p>Manage promotions</p>
      </RouterLink>
    </div>
  </div>
</template>
<style scoped src="@/assets/styles/select.css"></style>
