<template>
  <aside class="side-nav">
    <div class="side-nav__brand">
      <div class="side-nav__brand-logo">MA</div>
      <div class="side-nav__brand-text">
        <p class="side-nav__brand-title">My Admin</p>
        <p class="side-nav__brand-subtitle">Dashboard</p>
      </div>
    </div>

    <div class="side-nav__menu">
      <ul class="side-nav__list">
        <li class="side-nav__item">
          <RouterLink
            to="/admin"
            class="side-nav__link"
            active-class="side-nav__link--active"
            :class="{ 'side-nav__link--active': isActive('/admin') }"
          >
            <span>Dashboard</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/users"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span>Users</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/orders"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span>Orders</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/products"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span>Products</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <RouterLink
            to="/admin/gems-packages"
            class="side-nav__link"
            active-class="side-nav__link--active"
          >
            <span>Gems Packages</span>
          </RouterLink>
        </li>

        <li class="side-nav__item">
          <button type="button" class="side-nav__group-header" @click="toggleGroup('forms')">
            <span style="flex: 1">Forms</span>
            <span :style="{ transform: isGroupOpen('forms') ? 'rotate(90deg)' : 'rotate(0deg)' }">
              ›
            </span>
          </button>

          <ul v-if="isGroupOpen('forms')" class="side-nav__sub-list">
            <li>
              <RouterLink
                to="/admin/register-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Register Form
              </RouterLink>
            </li>

            <!-- you don't have /admin/another-form in router, so remove it (or add route) -->
            <!--
            <li>
              <RouterLink to="/admin/another-form" class="side-nav__sub-link">Another Form</RouterLink>
            </li>
            -->

            <li>
              <RouterLink
                to="/admin/category-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Category Form
              </RouterLink>
            </li>

            <li>
              <RouterLink
                to="/admin/craft-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Craft Form
              </RouterLink>
            </li>

            <li>
              <RouterLink
                to="/admin/gem-type-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Gems Type Register Form
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/admin/seller-form"
                class="side-nav__sub-link"
                active-class="side-nav__sub-link--active"
              >
                Seller Register Form
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const openGroupId = ref<string | null>('forms')

  function toggleGroup(id: string) {
    openGroupId.value = openGroupId.value === id ? null : id
  }
  function isGroupOpen(id: string) {
    return openGroupId.value === id
  }

  // Optional: make Dashboard link active on /admin exactly
  function isActive(path: string) {
    return route.path === path
  }
</script>
