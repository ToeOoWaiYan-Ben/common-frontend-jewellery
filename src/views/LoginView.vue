<template>
  <main class="login-page">
    <form class="login-card" @submit.prevent="onSubmit">
      <h1 class="login-title">Admin Login</h1>
      <p class="login-subtitle">Sign in to manage the system</p>

      <!-- Email -->
      <label class="login-label">Email</label>
      <input
        v-model.trim="form.email"
        type="email"
        class="login-input"
        placeholder="john@example.com"
        required
      />

      <!-- Password -->
      <label class="login-label">Password</label>
      <input
        v-model="form.password"
        type="password"
        class="login-input"
        placeholder="••••••••"
        required
      />

      <!-- Forgot -->
      <div class="forgot-row">
        <button
          type="button"
          class="forgot-link"
          :disabled="forgotLoading"
          @click="goToForgot"
        >
          {{ forgotLoading ? 'Sending...' : 'Forgot password?' }}
        </button>
      </div>

      <!-- Error -->
      <p v-if="error" class="login-error">{{ error }}</p>

      <!-- Button -->
      <button class="login-btn" :disabled="loading">
        {{ loading ? 'Logging in…' : 'Login' }}
      </button>
    </form>

    <!-- ✅ TOAST -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'
import { http } from '../services/http'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const forgotLoading = ref(false)

const loading = computed(() => auth.loading)
const error = computed(() => auth.error)

// ✅ TOAST STATE
const toast = reactive({
  show: false,
  message: '',
  type: 'success', // success | error
})

// ✅ SHOW TOAST FUNCTION
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

async function goToForgot() {
  if (!form.email.trim()) {
    showToast('Please enter your email first.', 'error')
    return
  }

  if (!form.email.endsWith('@gmail.com')) {
    showToast('Only Gmail is allowed.', 'error')
    return
  }

  forgotLoading.value = true

  try {
    await http('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    showToast('Reset link sent to your email!', 'success')
  } catch (e: any) {
    showToast(e?.message || 'Error sending email', 'error')
  } finally {
    forgotLoading.value = false
  }
}

async function onSubmit() {
  try {
    await auth.login(form)
    router.push('/admin')
  } catch {}
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f8fafc;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 14px;
}

.login-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.login-subtitle {
  margin: 0 0 10px;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.login-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.login-input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  outline: none;
  font-size: 14px;
}

.login-input:focus {
  border-color: #2563eb;
}

.login-btn {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.7;
}

.login-error {
  color: #dc2626;
  font-size: 13px;
  text-align: center;
}

/* Forgot */
.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -6px;
}

.forgot-link {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* ✅ TOAST */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  animation: fadeIn 0.3s ease;
  z-index: 9999;
}

.toast.success {
  background: #22c55e;
}

.toast.error {
  background: #ef4444;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>