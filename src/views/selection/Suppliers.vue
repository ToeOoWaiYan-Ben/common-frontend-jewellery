<template>
  <div class="settings-page">
    <h1 class="settings-title">Suppliers</h1>
    <p class="settings-sub">Choose what to manage</p>

    <div class="grid">
      <RouterLink to="/admin/seller-form" class="card">
        <h3>Merchants</h3>
        <p>Manage merchants</p>
      </RouterLink>

      <RouterLink to="/admin/gold-source" class="card">
        <h3>Gold Sources</h3>
        <p>Manage</p>
      </RouterLink>

      <RouterLink to="/admin/gems-packages" class="card">
        <h3>Gem Packages</h3>
        <p>Manage packages</p>
      </RouterLink>
    </div>
  </div>
</template>
<style scoped src="@/assets/styles/select.css"></style>
