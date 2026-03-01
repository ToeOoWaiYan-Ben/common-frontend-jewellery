<template>
  <div class="settings-page">
    <h1 class="settings-title">Operations</h1>
    <p class="settings-sub">Choose what to manage</p>

    <div class="grid">
      <RouterLink to="/admin/orders" class="card">
        <h3>Orders</h3>
        <p>Manage orders</p>
      </RouterLink>

      <RouterLink to="/admin/purchase" class="card">
        <h3>Purchases</h3>
        <p>Manage purchases</p>
      </RouterLink>
      <RouterLink to="/admin/vendors" class="card">
        <h3>Vendors</h3>
        <p>Manage vendors</p>
      </RouterLink>
    </div>
  </div>
</template>
<style scoped src="@/assets/styles/select.css"></style>
