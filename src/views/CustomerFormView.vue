<!-- src/views/CustomerFormView.vue -->
<template>
    <section>
      <!-- Header -->
      <div class="users-header">
        <div>
          <h2 class="page-title">New Customer</h2>
          <p class="users-meta">Create a new customer account.</p>
        </div>
  
        <RouterLink to="/customers" class="users-search__back-link">
          ← Back to Customers
        </RouterLink>
      </div>
  
      <!-- Form card -->
      <div class="card">
        <form class="category-form" @submit.prevent="handleSubmit">
          <p v-if="formError" class="users-empty users-empty--error">
            {{ formError }}
          </p>
  
          <!-- Name -->
          <div class="category-form__row">
            <label class="category-form__label" for="name">Name *</label>
            <input
              id="name"
              v-model="name"
              type="text"
              class="category-form__input"
              placeholder="e.g. John Doe"
              required
            />
          </div>
  
          <!-- Phone -->
          <div class="category-form__row">
            <label class="category-form__label" for="phone">Phone *</label>
            <input
              id="phone"
              v-model="phone"
              type="text"
              class="category-form__input"
              placeholder="e.g. 09xxxxxxxx"
              required
            />
          </div>
  
          <!-- Address -->
          <div class="category-form__row">
            <label class="category-form__label" for="address">Address *</label>
            <input
              id="address"
              v-model="address"
              type="text"
              class="category-form__input"
              placeholder="e.g. Bangkok, Thailand"
              required
            />
          </div>
  
          <!-- Role -->
          <div class="category-form__row">
            <label class="category-form__label" for="role">Role *</label>
            <input
              id="role"
              v-model="role"
              type="text"
              class="category-form__input"
              placeholder="e.g. Admin / Staff / Customer"
              required
            />
          </div>
  
          <!-- Password -->
          <div class="category-form__row">
            <label class="category-form__label" for="password">Password *</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="category-form__input"
              placeholder="Minimum 6 characters"
              required
            />
          </div>
  
          <!-- Gmail (optional) -->
          <div class="category-form__row">
            <label class="category-form__label" for="gmail">Gmail (optional)</label>
            <input
              id="gmail"
              v-model="gmail"
              type="email"
              class="category-form__input"
              placeholder="e.g. someone@gmail.com"
            />
          </div>
  
          <!-- Buttons -->
          <div class="category-form__actions">
            <RouterLink to="/customers" class="btn-secondary" type="button">
              Cancel
            </RouterLink>
  
            <button class="btn-primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving…' : 'Save Customer' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCustomersStore } from '../stores/useCustomersStore'
  
  const customersStore = useCustomersStore()
  const router = useRouter()
  
  const name = ref('')
  const phone = ref('')
  const address = ref('')
  const role = ref('')
  const password = ref('')
  const gmail = ref('')
  
  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)
  
  const handleSubmit = async () => {
    formError.value = null
  
    if (
      !name.value.trim() ||
      !phone.value.trim() ||
      !address.value.trim() ||
      !role.value.trim() ||
      !password.value.trim()
    ) {
      formError.value = 'Name, Phone, Address, Role and Password are required.'
      return
    }
  
    isSubmitting.value = true
    try {
      await customersStore.createCustomer({
        name: name.value.trim(),
        phone: phone.value.trim(),
        address: address.value.trim(),
        role: role.value.trim(),
        password: password.value.trim(),
        gmail: gmail.value.trim() || undefined
      })
  
      router.push('/customers')
    } catch (e: any) {
      formError.value =
        e?.message ?? 'Something went wrong while creating the customer.'
    } finally {
      isSubmitting.value = false
    }
  }
  </script>