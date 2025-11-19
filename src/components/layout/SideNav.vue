<!-- src/components/layout/SideNav.vue -->
<template>
  <aside class="side-nav">
    <div class="side-nav__scroll">
      <!-- small brand block in sidebar -->
      <div class="side-nav__brand">
        <div class="side-nav__brand-mark">MT</div>
        <div>
          <div class="side-nav__brand-name">Myint Thar Oo Jewellery Shop</div>
          <div class="side-nav__brand-meta">Control panel</div>
        </div>
      </div>

      <nav>
        <p class="side-nav__section-label">Main</p>
        <ul class="side-nav__list">
          <li>
            <RouterLink to="/" class="side-nav__link" active-class="side-nav__link--active">
              <span class="side-nav__link-icon"></span>
              <span class="side-nav__link-label">Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/users" class="side-nav__link" active-class="side-nav__link--active">
              <span class="side-nav__link-icon"></span>
              <span class="side-nav__link-label">Users</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/orders" class="side-nav__link" active-class="side-nav__link--active">
              <span class="side-nav__link-icon"></span>
              <span class="side-nav__link-label">Orders</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/products" class="side-nav__link" active-class="side-nav__link--active">
              <span class="side-nav__link-icon"></span>
              <span class="side-nav__link-label">Products</span>
            </RouterLink>
          </li>

          <li class="side-nav__group">
            <button type="button" class="side-nav__group-header" @click="toggleGroup('forms')">
              <span class="side-nav__group-label">Forms</span>
              <span
                class="side-nav__group-chevron"
                :class="{ 'side-nav__group-chevron--open': isGroupOpen('forms') }"
              >
                ▾
              </span>
            </button>

            <ul v-if="isGroupOpen('forms')" class="side-nav__sub-list">
              <li>
                <RouterLink
                  to="/register-form"
                  class="side-nav__sub-link"
                  active-class="side-nav__sub-link--active"
                >
                  <span class="side-nav__sub-bullet"></span>
                  <span>Register Form</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/another-form"
                  class="side-nav__sub-link"
                  active-class="side-nav__sub-link--active"
                >
                  <span class="side-nav__sub-bullet"></span>
                  <span>Another Form</span>
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
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
