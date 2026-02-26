<template>
  <div class="settings-page">
    <h1 class="settings-title">Users</h1>
    <p class="settings-sub">Choose what to manage</p>

    <div class="grid">
      <RouterLink to="/admin/users" class="card">
        <h3>Users</h3>
        <p>Manage users</p>
      </RouterLink>

      <RouterLink to="/admin/customers" class="card">
        <h3>Customers</h3>
        <p>Manage customers</p>
      </RouterLink>

      <RouterLink to="/admin/register-form" class="card">
        <h3>Register</h3>
      </RouterLink>
    </div>
  </div>
</template>
<style scoped src="@/assets/styles/select.css"></style>
