<template>
  <aside class="side-nav">
    <nav>
      <ul class="side-nav__list">
        <li>
          <RouterLink to="/" class="side-nav__link" active-class="side-nav__link--active">
            Home
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/users" class="side-nav__link" active-class="side-nav__link--active">
            Users
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/orders" class="side-nav__link" active-class="side-nav__link--active">
            Orders
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/products" class="side-nav__link" active-class="side-nav__link--active">
            Products
          </RouterLink>
        </li>
        <li class="side-nav__group">
          <button type="button" class="side-nav__group-header" @click="toggleGroup('forms')">
            <!-- <span class="side-nav__group-icon">🌲</span> -->
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
