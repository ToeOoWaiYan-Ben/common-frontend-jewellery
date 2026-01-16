<template>
  <div class="settings-page">
    <h1 class="settings-title">Setting</h1>
    <p class="settings-sub">Choose a form to open</p>

    <div class="grid">
      <RouterLink to="/admin/register-form" class="card">
        <h3>Register Form</h3>
        <p>Create new admin/user</p>
      </RouterLink>

      <RouterLink to="/admin/category-form" class="card">
        <h3>Category Form</h3>
        <p>Manage categories</p>
      </RouterLink>

      <RouterLink to="/admin/craft-form" class="card">
        <h3>Craft Form</h3>
        <p>Manage crafts</p>
      </RouterLink>

      <RouterLink to="/admin/gem-type-form" class="card">
        <h3>Gems Type Form</h3>
        <p>Manage gem types</p>
      </RouterLink>

      <RouterLink to="/admin/seller-form" class="card">
        <h3>Seller Form</h3>
        <p>Manage sellers</p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .settings-page {
    width: 100%;
    min-height: calc(100vh - 60px);
    padding: 24px;
  }

  .settings-title {
    margin: 0;
    font-size: 26px;
    font-weight: 800;
  }
  .settings-sub {
    margin: 8px 0 18px;
    color: #6b7280;
  }

  .grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(220px, 1fr));
    gap: 16px;
  }

  .card {
    display: block;
    text-decoration: none;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 18px;
    color: #111827;
    transition:
      transform 0.12s ease,
      border-color 0.12s ease,
      box-shadow 0.12s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: #c7d2fe;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  }

  .card h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 800;
  }

  .card p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }

  @media (max-width: 1100px) {
    .grid {
      grid-template-columns: repeat(2, minmax(220px, 1fr));
    }
  }
  @media (max-width: 700px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
