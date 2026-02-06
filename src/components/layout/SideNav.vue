<template>
  <aside class="side-nav">
    <!-- Menu -->
    <div class="side-nav__menu">
      <ul class="side-nav__list">
        <li class="side-nav__item">
          <RouterLink to="/admin" class="side-nav__link"> Dashboard </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/users"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            Users
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/orders"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            Orders
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/products"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            Products List
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/gems-packages"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            Gems Packages
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/settings"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            Settings
          </RouterLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { useAuthStore } from '@/stores/useAuthStore'
  const auth = useAuthStore()
</script>

<style scoped>
  .side-nav {
    width: 260px;
    min-height: 100vh;
    background: #f6f8ff;
    border-right: 1px solid #e7eaf5;
  }

  .side-nav__brand {
    display: flex;
    gap: 12px;
    padding: 18px 16px;
    align-items: center;
    border-bottom: 1px solid #e7eaf5;
    background: #fff;
  }

  .side-nav__brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #5a67d8;
    color: #fff;
    font-weight: 700;
  }

  .side-nav__brand-title {
    font-weight: 700;
    margin: 0;
  }
  .side-nav__brand-subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  .side-nav__menu {
    padding: 12px 10px;
  }
  .side-nav__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  .side-nav__link {
    display: block;
    padding: 12px;
    border-radius: 12px;
    text-decoration: none;
    color: #1f2937;
    font-size: 14px;
  }
  .side-nav__link:hover {
    background: #eef2ff;
  }
  .side-nav__link--active {
    background: #000000a1;
    color: #ffffff;
  }
</style>
