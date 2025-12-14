<template>
  <aside class="side-nav">
    <!-- Brand/top area -->
    <div class="side-nav__brand">
      <div class="side-nav__brand-logo">MA</div>
      <div class="side-nav__brand-text">
        <p class="side-nav__brand-title">My Admin</p>
        <p class="side-nav__brand-subtitle">Dashboard</p>
      </div>
    </div>

    <!-- Menu -->
    <div class="side-nav__menu">
      <ul class="side-nav__list">
        <li class="side-nav__item">
          <RouterLink
            to="/"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span class="side-nav__link-icon">📊</span>
            <span class="side-nav__link-label">Dashboard</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/users"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span class="side-nav__link-icon">👥</span>
            <span class="side-nav__link-label">Users</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/orders"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span class="side-nav__link-icon">🧾</span>
            <span class="side-nav__link-label">Orders</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/products"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span class="side-nav__link-icon">📦</span>
            <span class="side-nav__link-label">Products</span>
          </RouterLink>
        </li>

        <!-- Forms group -->
        <li class="side-nav__item">
          <button
            type="button"
            class="side-nav__group-header"
            @click="toggleGroup('forms')"
          >
            <div class="side-nav__group-header-inner">
              <span class="side-nav__link-icon">✎</span>
              <span class="side-nav__group-label">Forms</span>
              <span
                class="side-nav__group-chevron"
                :class="{ 'side-nav__group-chevron--open': isGroupOpen('forms') }"
              >
                ›
              </span>
            </div>
          </button>

          <ul v-if="isGroupOpen('forms')" class="side-nav__sub-list">
            <li>
              <RouterLink
                to="/register-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Register Form
              </RouterLink>
            </li>

            <li>
              <RouterLink
                to="/another-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Another Form
              </RouterLink>
            </li>

            <li>
              <RouterLink
                to="/category-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Category Form
              </RouterLink>
            </li>

            <!-- ✅ NEW: Craft Form -->
            <li>
              <RouterLink
                to="/craft-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Craft Form
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const openGroupId = ref<string | null>('forms')

function toggleGroup(id: string) {
  openGroupId.value = openGroupId.value === id ? null : id
}

function isGroupOpen(id: string) {
  return openGroupId.value === id
}
</script>
