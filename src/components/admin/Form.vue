<template>
  <section class="panel">
    <div class="category-form">
      <h3 class="category-form__title">{{ title }}</h3>

      <div v-if="error" class="alert alert--error">
        <span class="alert__icon">⚠</span>
        <span>{{ error }}</span>
      </div>

      <div class="category-form__body">
        <slot />
      </div>

      <div class="category-form__actions">
        <button class="btn-secondary" type="button" @click="$emit('cancel')" :disabled="submitting">
          Cancel
        </button>

        <button class="btn-primary" type="button" @click="$emit('submit')" :disabled="submitting">
          {{ submitting ? busyLabel : submitLabel }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
    submitLabel: string
    busyLabel?: string
    submitting?: boolean
    error?: string | null
  }>()

  defineEmits<{
    (e: 'submit'): void
    (e: 'cancel'): void
  }>()
</script>
