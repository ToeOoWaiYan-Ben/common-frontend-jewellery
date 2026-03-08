<template>
  <header class="app-header">

    <!-- Shop Brand -->
    <div class="app-header__brand">
      <span class="app-header__logo">💎</span>
      <span class="app-header__shop">MYIT TAR OO</span>
    </div>

    <!-- User Section -->
    <div class="app-header__user">

      <div class="app-header__user-meta">
        <span class="app-header__user-name">
          {{ auth.userName }}
        </span>
        <span class="app-header__user-role">
          {{ auth.userRole }}
        </span>
      </div>

      <div class="app-header__avatar">
        {{ auth.userName?.charAt(0).toUpperCase() }}
      </div>

      <button
        class="app-header__logout"
        type="button"
        @click="handleLogout"
      >
        Logout
      </button>

    </div>

  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.replace('/login')
}
</script>

<style scoped>

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 28px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

/* Brand */

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__logo {
  font-size: 22px;
}

.app-header__shop {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #111827;
}

/* User */

.app-header__user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-header__user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.app-header__user-name {
  font-size: 14px;
  font-weight: 600;
}

.app-header__user-role {
  font-size: 12px;
  color: #6b7280;
}

.app-header__avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2563eb;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-weight: 700;
}

/* Logout */

.app-header__logout {
  padding: 7px 14px;
  border-radius: 8px;
  border: none;

  background: #ef4444;
  color: white;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
  transition: background 0.2s ease;
}

.app-header__logout:hover {
  background: #dc2626;
}

</style>