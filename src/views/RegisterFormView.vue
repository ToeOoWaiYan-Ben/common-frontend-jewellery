<!-- src/views/RegisterFormView.vue -->
<template>
  <section>
    <h2 class="page-title">Register Form</h2>

    <div class="card register-form">
      <form @submit.prevent="onSubmit">
        <div class="form-row">
          <label for="name">Name</label>
          <input id="name" v-model="form.name" type="text" />
        </div>

        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" />
        </div>

        <div class="form-row">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" />
        </div>

        <button type="submit" class="btn-primary">Register</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  interface RegisterForm {
    name: string
    email: string
    password: string
  }

  const form = reactive<RegisterForm>({
    name: '',
    email: '',
    password: '',
  })

  function onSubmit() {
    console.log('Register form data:', form)
    alert('Submitted! (check console)')
  }
</script>

<style scoped>
  .register-form {
    max-width: 400px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.75rem;
  }

  label {
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  input {
    padding: 0.45rem 0.6rem;
    border-radius: 0.35rem;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
  }

  .btn-primary {
    margin-top: 0.25rem;
    padding: 0.5rem 0.9rem;
    border-radius: 0.35rem;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    background-color: #2563eb;
    color: #fff;
  }
</style>
