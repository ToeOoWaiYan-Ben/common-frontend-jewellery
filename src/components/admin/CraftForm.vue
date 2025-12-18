<template>
  <BaseForm
    :title="title"
    :submitLabel="submitLabel"
    :busyLabel="busyLabel"
    :submitting="submitting"
    :error="error"
    @submit="$emit('submit')"
    @cancel="$emit('cancel')"
  >
    <div class="category-form__row">
      <label class="category-form__label">Shop Name *</label>
      <input
        v-model="shopNameModel"
        class="category-form__input"
        placeholder="e.g. ABC Craft Shop"
      />
    </div>

    <div class="category-form__row">
      <label class="category-form__label">NRC *</label>
      <input
        v-model="nrcModel"
        class="category-form__input"
        placeholder="e.g. 12/ABC(N)123456"
      />
    </div>

    <div class="category-form__row">
      <label class="category-form__label">Phone *</label>
      <input
        v-model="phoneModel"
        class="category-form__input"
        placeholder="e.g. 09xxxxxxxx"
      />
    </div>

    <div class="category-form__row">
      <label class="category-form__label">Address *</label>
      <input
        v-model="addressModel"
        class="category-form__input"
        placeholder="e.g. Bangkok"
      />
    </div>
  </BaseForm>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseForm from './Form.vue' 
const props = defineProps<{
  title: string
  submitLabel: string
  busyLabel?: string
  submitting?: boolean
  error?: string | null

  shopName: string
  nrc: string
  phone: string
  address: string
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void

  (e: 'update:shopName', v: string): void
  (e: 'update:nrc', v: string): void
  (e: 'update:phone', v: string): void
  (e: 'update:address', v: string): void
}>()

const shopNameModel = computed({
  get: () => props.shopName,
  set: (v) => emit('update:shopName', v)
})

const nrcModel = computed({
  get: () => props.nrc,
  set: (v) => emit('update:nrc', v)
})

const phoneModel = computed({
  get: () => props.phone,
  set: (v) => emit('update:phone', v)
})

const addressModel = computed({
  get: () => props.address,
  set: (v) => emit('update:address', v)
})

</script>
