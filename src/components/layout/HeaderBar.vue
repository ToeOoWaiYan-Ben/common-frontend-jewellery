<template>
  <header class="app-header">
    <!-- Brand (clickable optional) -->
    <div class="app-header__brand">
      <span class="app-header__logo">💎</span>
      <span class="app-header__shop">MYIT TAR OO</span>
    </div>

    <!-- User -->
    <div class="app-header__user">
      

      <button class="app-header__logout" @click="handleLogout">
        Logout
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const auth = useAuthStore()

// ✅ FIXED: safe display values
const displayName = computed(() => {
  return auth.userName?.trim() || 'User'
})

const displayRole = computed(() => {
  return auth.userRole?.toUpperCase() || 'ROLE'
})

const avatarLetter = computed(() => {
  return displayName.value.charAt(0).toUpperCase()
})

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