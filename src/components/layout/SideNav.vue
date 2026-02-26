<template>
  <aside class="side-nav">
    <div class="side-nav__menu">
      <ul class="side-nav__list">
        <li class="side-nav__item">
          <RouterLink to="/admin" class="side-nav__link" active-class="side-nav__link--active">
            Dashboard
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/selection/operations"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            📦 Operations
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/selection/products"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            💎 Products
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/selection/suppliers"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            🏭 Suppliers
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/selection/pricing"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            💰 Pricing
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/selection/users"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            👥 Users
          </RouterLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts"></script>
