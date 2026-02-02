<template>
  <div class="preg">
    <div class="preg__header">
      <button class="preg__back" type="button" @click="goBack">← Back to products</button>
    </div>

    <div class="preg__titleWrap">
      <h2 class="preg__title">{{ isEdit ? 'Edit product' : 'Add product' }}</h2>
      <p class="preg__subtitle">Fill product information based on the Product table columns.</p>
    </div>

    <div class="preg__layout">
      <div class="preg__left">
        <!-- Image area -->
        <div class="preg__card">
          <div class="preg__imagesRow">
            <div class="preg__imagePreview">
              <div class="preg__imagePreviewText">
                <div class="preg__imagePreviewTitle">No image yet</div>
                <div class="preg__imagePreviewSub">Upload 1–4 images. First is used as cover.</div>
              </div>
            </div>

            <div class="preg__upload">
              <div class="preg__uploadTitle">Images</div>
              <div class="preg__uploadSub">Click to choose or drop images (JPG / PNG)</div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form class="preg__card" @submit.prevent="onSubmit">
          <div v-if="formError" class="preg__alert">
            <span class="preg__alertIcon">⚠</span>
            <span>{{ formError }}</span>
          </div>

          <div class="preg__grid">
            <!-- name -->
            <div class="preg__field">
              <label class="preg__label">Name *</label>
              <input
                v-model="form.name"
                class="preg__input"
                type="text"
                required
                maxlength="50"
                placeholder="e.g. Gold Ring"
              />
            </div>

            <!-- code -->
            <div class="preg__field">
              <label class="preg__label">Code</label>
              <input
                v-model="form.code"
                class="preg__input"
                type="text"
                placeholder="e.g. GR-001"
              />
            </div>

            <!-- stock_status (select like screenshot) -->
            <div class="preg__field">
              <label class="preg__label" for="stockStatus">Stock Status</label>

              <div class="preg__selectWrap">
                <select id="stockStatus" v-model="form.stockStatus" class="preg__select">
                  <option value="" disabled>Select status</option>
                  <option v-for="s in stockStatusOptions" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- qty -->
            <div class="preg__field">
              <label class="preg__label">Qty</label>
              <input
                v-model.number="form.qty"
                class="preg__input"
                type="number"
                min="0"
                placeholder="e.g. 10"
              />
            </div>

            <!-- collection -->
            <div class="preg__field">
              <label class="preg__label">Collection</label>
              <input
                v-model="form.collection"
                class="preg__input"
                type="text"
                maxlength="50"
                placeholder="e.g. Classic"
              />
            </div>

            <!-- product_type_id -->
            <div class="preg__field">
              <label class="preg__label">Product Type ID *</label>
              <input
                v-model.number="form.productTypeId"
                class="preg__input"
                type="number"
                min="1"
                required
                placeholder="e.g. 1"
              />
            </div>

            <!-- short_desc -->
            <div class="preg__field preg__field--full">
              <label class="preg__label">Short Desc</label>
              <input
                v-model="form.shortDesc"
                class="preg__input"
                type="text"
                maxlength="100"
                placeholder="e.g. 18K gold ring"
              />
            </div>

            <!-- desc (varchar300) -->
            <div class="preg__field preg__field--full">
              <label class="preg__label">Desc (varchar300)</label>
              <textarea
                v-model="form.desc"
                class="preg__textarea"
                rows="3"
                maxlength="300"
                placeholder="Write product description (max 300 chars)…"
              ></textarea>
            </div>

            <!-- color (bigint) -->
            <div class="preg__field">
              <label class="preg__label">Color (ID)</label>
              <input
                v-model.number="form.color"
                class="preg__input"
                type="number"
                min="0"
                placeholder="e.g. 1"
              />
            </div>

            <!-- color_count (int) -->
            <div class="preg__field">
              <label class="preg__label">Color Count</label>
              <input
                v-model.number="form.colorCount"
                class="preg__input"
                type="number"
                min="0"
                placeholder="e.g. 2"
              />
            </div>

            <!-- weight (float) -->
            <div class="preg__field">
              <label class="preg__label">Weight</label>
              <input
                v-model.number="form.weight"
                class="preg__input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 5.20"
              />
            </div>

            <!-- metarial_loss (float) -->
            <div class="preg__field">
              <label class="preg__label">Metarial Loss</label>
              <input
                v-model.number="form.metarialLoss"
                class="preg__input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 0.30"
              />
            </div>

            <!-- making_cost (float) -->
            <div class="preg__field">
              <label class="preg__label">Making Cost</label>
              <input
                v-model.number="form.makingCost"
                class="preg__input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 120.00"
              />
            </div>

            <!-- depreciation (float) -->
            <div class="preg__field">
              <label class="preg__label">Depreciation *</label>
              <input
                v-model.number="form.depreciation"
                class="preg__input"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="e.g. 0.10"
              />
            </div>
          </div>

          <div class="preg__actions">
            <button class="preg__btn preg__btn--ghost" type="button" @click="goBack">Cancel</button>
            <button class="preg__btn preg__btn--primary" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Save product') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useProductsStore } from '../stores/useProductsStore'

  const router = useRouter()
  const route = useRoute()
  const productsStore = useProductsStore()

  const isEdit = computed(() => !!route.params.id)

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  const stockStatusOptions = [
    { value: 'IN_STOCK', label: 'Stock' },
    { value: 'LOW_STOCK', label: 'Low Stock' },
    { value: 'OUT_OF_STOCK', label: 'Out of stock' },
  ]

  const form = reactive({
    name: '',
    code: '',
    stockStatus: '',
    desc: '',
    qty: 0,
    collection: '',
    shortDesc: '',
    color: 0,
    weight: 0,
    metarialLoss: 0,
    makingCost: 0,
    colorCount: 0,
    depreciation: 0,
    productTypeId: 1,
  })

  const goBack = () => {
    router.push('/admin/products')
  }

  const onSubmit = async () => {
    formError.value = null

    if (!form.name.trim()) {
      formError.value = 'Name is required.'
      return
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      stockStatus: form.stockStatus,
      desc: form.desc.trim(),
      qty: Number(form.qty ?? 0),
      collection: form.collection.trim(),
      shortDesc: form.shortDesc.trim(),
      color: Number(form.color ?? 0),
      weight: Number(form.weight ?? 0),
      metarialLoss: Number(form.metarialLoss ?? 0),
      makingCost: Number(form.makingCost ?? 0),
      colorCount: Number(form.colorCount ?? 0),
      depreciation: Number(form.depreciation ?? 0),
      productTypeId: Number(form.productTypeId),
    }

    isSubmitting.value = true
    try {
      if (isEdit.value) {
        await productsStore.updateProduct(Number(route.params.id), payload)
      } else {
        await productsStore.createProduct(payload)
      }
      goBack()
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save product.'
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<style scoped>
  .preg {
    padding: 18px 18px 30px;
    background: #f3f4f6;
    min-height: calc(100vh - 20px);
  }

  .preg__header {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 14px;
  }

  .preg__back {
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 900;
    color: #2563eb;
  }

  .preg__titleWrap {
    margin: 12px 2px 14px;
  }

  .preg__title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
  }

  .preg__subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  .preg__layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .preg__card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 14px;
  }

  .preg__imagesRow {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 12px;
  }

  .preg__imagePreview {
    background: #0b1220;
    border-radius: 14px;
    min-height: 110px;
    display: grid;
    place-items: center;
    color: #e5e7eb;
  }

  .preg__imagePreviewText {
    text-align: center;
    padding: 8px;
  }

  .preg__imagePreviewTitle {
    font-weight: 900;
    margin-bottom: 4px;
  }

  .preg__imagePreviewSub {
    font-size: 12px;
    opacity: 0.85;
  }

  .preg__upload {
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    padding: 12px;
    display: grid;
    align-content: center;
    gap: 4px;
  }

  .preg__uploadTitle {
    font-weight: 900;
    color: #111827;
  }

  .preg__uploadSub {
    font-size: 12px;
    color: #6b7280;
  }

  .preg__alert {
    display: flex;
    gap: 8px;
    align-items: center;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
    padding: 10px 12px;
    border-radius: 12px;
    margin-bottom: 12px;
    font-size: 13px;
  }

  .preg__alertIcon {
    font-size: 16px;
  }

  .preg__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }

  .preg__field {
    display: grid;
    gap: 6px;
  }

  .preg__field--full {
    grid-column: 1 / -1;
  }

  .preg__label {
    font-size: 13px;
    font-weight: 900;
    color: #374151;
  }

  .preg__input,
  .preg__textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }

  .preg__input:focus,
  .preg__textarea:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18);
  }

  .preg__textarea {
    resize: vertical;
  }

  .preg__selectWrap {
    position: relative;
    width: 100%;
  }

  .preg__select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 10px 40px 10px 12px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
    cursor: pointer;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }

  .preg__select:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18);
  }

  .preg__selectWrap::after {
    content: '';
    position: absolute;
    right: 14px;
    top: 50%;
    width: 8px;
    height: 8px;
    border-right: 2px solid #6b7280;
    border-bottom: 2px solid #6b7280;
    transform: translateY(-60%) rotate(45deg);
    pointer-events: none;
  }

  .preg__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
  }

  .preg__btn {
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 900;
    cursor: pointer;
    font-size: 14px;
  }

  .preg__btn--ghost {
    background: #f3f4f6;
    color: #111827;
  }

  .preg__btn--primary {
    background: #f59e0b;
    color: #111827;
  }

  @media (max-width: 900px) {
    .preg__grid {
      grid-template-columns: 1fr;
    }
    .preg__imagesRow {
      grid-template-columns: 1fr;
    }
  }
</style>
