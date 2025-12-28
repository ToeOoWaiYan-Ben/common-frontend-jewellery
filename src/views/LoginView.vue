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
  
        <!-- Error -->
        <p v-if="error" class="login-error">{{ error }}</p>
  
        <!-- Button -->
        <button class="login-btn" :disabled="loading">
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>
      </form>
    </main>
  </template>
  
  <script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/useAuthStore'
  
  const router = useRouter()
  const auth = useAuthStore()
  
  const form = reactive({
    email: '',
    password: '',
  })
  
  const loading = computed(() => auth.loading)
  const error = computed(() => auth.error)
  
  async function onSubmit() {
    try {
      await auth.login(form)
      router.push('/')
    } catch {
      // error already handled in store
    }
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
    cursor: not-allowed;
  }
  
  .login-error {
    color: #dc2626;
    font-size: 13px;
    margin: 4px 0 0;
    text-align: center;
  }
  </style>