<template>
  <main class="login-page">
    <form class="login-card" @submit.prevent="submit">
      <h1>Reset Password</h1>

      <input
        v-model="password"
        type="password"
        placeholder="New Password"
        required
        class="login-input"
      />

      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        required
        class="login-input"
      />

      <button class="login-btn">Change Password</button>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { http } from '../services/http'
import { useAuthStore } from '../stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const token = route.query.token as string

async function submit() {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match")
    return
  }

  await http('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token,
      password: password.value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 🔥 THIS IS THE FIX
  auth.logout()

  alert("Password updated! Please login again.")

  router.push('/login')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  padding: 20px;
}

/* Card */
.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 32px 28px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.4s ease;
}

/* Title */
.login-card h1 {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #1e293b;
}

/* Inputs */
.login-input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  transition: all 0.2s ease;
}

.login-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  outline: none;
}

/* Button */
.login-btn {
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25);
}

.login-btn:active {
  transform: scale(0.98);
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>