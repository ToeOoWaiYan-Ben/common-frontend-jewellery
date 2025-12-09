<script setup lang="ts">
import { RouterLink } from 'vue-router';

</script>

<template>
    <section>
        <div class="users-header">
            <div>
                <h2 class="page-title">New User</h2>
                <p class="users-meta">Create a new user.</p>
            </div>
            <RouterLink to="/users" class="users-search__back-link">Back to Users</RouterLink>
        </div>
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
        placeholder="e.g. 0912345678"
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
        v-model="hashPassword"
        type="password"
        class="category-form__input"
        placeholder="Enter a secure password"
        required
    />
</div>

            <!-- Buttons -->
            <div class="category-form__actions">
            <RouterLink to="/users" class="btn-secondary" type="button">
                Cancel
            </RouterLink>

            <button class="btn-primary" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving…' : 'Save User' }}
            </button>
            </div>
            </form>
        </div>
    </section>
</template>

<script>
import {ref}from 'vue'
import {useRouter} from 'vue-router'
import { useUsersStore}from '../stores/useUsersStore'
const usersStore=useUsersStore()
const router= useRouter()
const name = ref('')
const phone = ref('')
const address = ref('')
const role = ref('')
const hashPassword = ref('')
const isSubmitting = ref(false)
const formError = ref<string | null>(null)
const handleSubmit = async () => {
    formError.value = null
    if (!name.value.trim()|| !phone.value.trim() ||!address.value.trim()|| !role.value.trim() || !hashPassword.value.trim()){
        formError.value = 'Name, address and role are required.'
        return
    }
    isSubmitting.value = true

    try{
        await usersStore.createUser({
            name: name.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim() ,
            role: role.value.trim(),
            hashPassword: hashPassword.value.trim() 
        })
        router.push('/users')

    }catch (e: any){
        formError.value =
        e?.message ?? 'Something went wrong while creating users.'
    }finally{
        isSubmitting.value= false
    }
}

</script>
