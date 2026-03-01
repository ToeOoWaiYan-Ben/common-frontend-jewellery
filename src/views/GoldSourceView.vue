<!-- ===== GoldSourceView.vue (FULL FILE) ===== -->
<template>
  <TablePage
    title="Gold Source"
    :total="totalGoldSources"
    :filteredCount="filteredCount"
    :items="paginatedItems"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Create New Gold Source'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="gs-form" @submit.prevent="handleSubmitForm">
        <div class="gs-form__header">
          <h3 class="gs-form__title">{{ isEditing ? 'Edit Gold Source' : 'New Gold Source' }}</h3>
          <span class="gs-form__hint">Store supplier/source info for gold.</span>
        </div>

        <div v-if="formError" class="gs-alert gs-alert--error">
          <span class="gs-alert__icon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <div class="gs-grid">
          <div class="gs-field gs-field--full">
            <label class="gs-label" for="name">Name *</label>
            <input id="name" v-model="formName" class="gs-input" type="text" required />
          </div>

          <div class="gs-field">
            <label class="gs-label" for="goldPurity">Gold Purity *</label>

            <select id="goldPurity" v-model="formGoldPurity" class="gs-input" required>
              <option value="K24">24K</option>
              <option value="K22">22K</option>
              <option value="K18">18K</option>
              <option value="K22">16K</option>
              <option value="K14">14K</option>
              <option value="K22">13K</option>
            </select>
          </div>
          <div class="gs-field">
            <label class="gs-label" for="weight">Weight</label>
            <input
              id="weight"
              v-model.number="formWeight"
              class="gs-input"
              type="number"
              step="0.01"
            />
          </div>

          <div class="gs-field">
            <label class="gs-label" for="color">Color *</label>

            <select id="color" v-model="formColor" class="gs-input" required>
              <option value="">Select color</option>
              <option value="Yellow">Yellow Gold</option>
              <option value="White">White Gold</option>
              <option value="Rose">Rose Gold</option>
              <option value="Green">Green Gold</option>
            </select>
          </div>

          <div class="gs-field">
            <label class="gs-label" for="sourceCountry">Source Country</label>
            <input id="sourceCountry" v-model="formSourceCountry" class="gs-input" type="text" />
          </div>

          <div class="gs-field">
            <label class="gs-label" for="originalPrice">Original Price</label>
            <input
              id="originalPrice"
              v-model.number="formOriginalPrice"
              class="gs-input"
              type="number"
              step="0.01"
            />
          </div>

          <!-- ✅ Seller searchable dropdown -->
          <div class="gs-field">
            <label class="gs-label" for="sellerSearch">Seller</label>

            <input
              id="sellerSearch"
              v-model="sellerSearch"
              class="gs-input"
              type="text"
              placeholder="Search seller by name / id / email…"
            />

            <select v-model.number="formSellerId" class="gs-input" style="margin-top: 8px">
              <option :value="null">-- No seller --</option>
              <option v-for="s in filteredSellers" :key="s.id" :value="s.id">
                {{ s.id }} - {{ s.name }}{{ s.email ? ` (${s.email})` : '' }}
              </option>
            </select>

            <small class="gs-hint" v-if="sellersLoading">Loading sellers…</small>
            <small class="gs-hint gs-hint--error" v-if="sellersError">{{ sellersError }}</small>
          </div>
        </div>

        <div class="gs-actions">
          <button
            class="gs-btn gs-btn--ghost"
            type="button"
            @click="resetForm"
            :disabled="isSubmitting"
          >
            Reset
          </button>

          <button
            v-if="isEditing"
            class="gs-btn gs-btn--ghost"
            type="button"
            @click="closeEdit"
            :disabled="isSubmitting"
          >
            Close
          </button>

          <button class="gs-btn gs-btn--primary" type="submit" :disabled="isSubmitting">
            {{
              isSubmitting
                ? isEditing
                  ? 'Updating…'
                  : 'Saving…'
                : isEditing
                  ? 'Update Gold Source'
                  : 'Save Gold Source'
            }}
          </button>
        </div>
      </form>
    </template>

    <!-- SEARCH -->
    <template #search>
      <div class="gs-search">
        <span class="gs-search__icon">🔍</span>
        <input
          v-model="searchTerm"
          class="gs-search__input"
          type="text"
          placeholder="Search by name, country, color, purity…"
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Name</th>
      <th>Purity</th>
      <th>Weight</th>
      <th>Color</th>
      <th>Country</th>
      <th>Price</th>
      <th>Seller</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
      <td>{{ item.goldPurity }}</td>
      <td>{{ item.weight }}</td>
      <td>{{ item.color }}</td>
      <td>{{ item.sourceCountry }}</td>
      <td>{{ item.originalPrice }}</td>

      <!-- ✅ show seller NAME (not number) -->
      <td>
        {{
          item.sellerId != null
            ? (sellerNameById.get(item.sellerId) ?? `Seller #${item.sellerId}`)
            : '-'
        }}
      </td>

      <td>
        <div class="gs-row-actions">
          <button class="gs-mini" type="button" @click="onClickEdit(item)">Edit</button>
          <button class="gs-mini gs-mini--danger" type="button" @click="onClickDelete(item.id)">
            Delete
          </button>
        </div>
      </td>
    </template>
  </TablePage>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import TablePage from '../components/TablePage.vue'
  import { useGoldSourceStore } from '../stores/useGoldSourceStore'
  import { useSellersStore } from '../stores/useSellersStore'
  import type { GoldSourceDto } from '../dtos/GoldSourceDto'
  import type { SellerDto } from '../dtos/SellerDto'
  import { useRoute } from 'vue-router'
  const route = useRoute()

  const id = Number(route.params.id) // must match your router path like /products/:id/edit

  const gsStore = useGoldSourceStore()
  const sellersStore = useSellersStore()

  const { items, loading, error } = storeToRefs(gsStore)
  const {
    items: sellers,
    loading: sellersLoadingRef,
    error: sellersErrorRef,
  } = storeToRefs(sellersStore)

  const searchTerm = ref('')

  onMounted(() => {
    gsStore.loadAll()
    sellersStore.loadAll()
  })

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  const sellersLoading = computed(() => sellersLoadingRef.value)
  const sellersError = computed(() => sellersErrorRef.value)

  // ✅ Map sellerId -> sellerName (for table display)
  const sellerNameById = computed(() => {
    const map = new Map<number, string>()
    for (const s of sellers.value) map.set(s.id, s.name)
    return map
  })

  // filter gold sources (table search)
  const filteredItems = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return items.value

    return items.value.filter((x) => {
      return (
        x.name.toLowerCase().includes(term) ||
        (x.goldPurity ?? '').toLowerCase().includes(term) ||
        (x.color ?? '').toLowerCase().includes(term) ||
        (x.sourceCountry ?? '').toLowerCase().includes(term)
      )
    })
  })

  const totalGoldSources = computed(() => items.value.length)
  const filteredCount = computed(() => filteredItems.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  watch(filteredItems, () => {
    currentPage.value = 1
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  // form states
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const formName = ref('')
  const formGoldPurity = ref('')
  const formWeight = ref<number>(0)
  const formColor = ref('')
  const formSourceCountry = ref('')
  const formOriginalPrice = ref<number>(0)
  const formSellerId = ref<number | null>(null)

  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  // seller dropdown search
  const sellerSearch = ref('')

  const filteredSellers = computed(() => {
    const term = sellerSearch.value.trim().toLowerCase()
    if (!term) return sellers.value

    return sellers.value.filter((s: SellerDto) => {
      return (
        s.name.toLowerCase().includes(term) ||
        String(s.id).includes(term) ||
        (s.email ?? '').toLowerCase().includes(term) ||
        (s.phone ?? '').toLowerCase().includes(term)
      )
    })
  })

  const resetForm = () => {
    formName.value = ''
    formGoldPurity.value = ''
    formWeight.value = 0
    formColor.value = ''
    formSourceCountry.value = ''
    formOriginalPrice.value = 0
    formSellerId.value = null
    sellerSearch.value = ''
    formError.value = null
    isEditing.value = false
    editingId.value = null
  }

  const onClickNew = () => {
    if (showForm.value) {
      resetForm()
      showForm.value = false
      return
    }
    resetForm()
    showForm.value = true
  }

  const onClickEdit = (x: GoldSourceDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = x.id

    formName.value = x.name
    formGoldPurity.value = x.goldPurity ?? ''
    formWeight.value = Number(x.weight ?? 0)
    formColor.value = x.color ?? ''
    formSourceCountry.value = x.sourceCountry ?? ''
    formOriginalPrice.value = Number(x.originalPrice ?? 0)
    formSellerId.value = x.sellerId ?? null

    sellerSearch.value = x.sellerId != null ? String(x.sellerId) : ''

    formError.value = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const handleSubmitForm = async () => {
    formError.value = null

    if (!formName.value.trim()) {
      formError.value = 'Name is required.'
      return
    }

    const payload = {
      name: formName.value.trim(),
      goldPurity: formGoldPurity.value.trim(),
      weight: Number(formWeight.value ?? 0),
      color: formColor.value.trim(),
      sourceCountry: formSourceCountry.value.trim(),
      originalPrice: Number(formOriginalPrice.value ?? 0),
      sellerId: formSellerId.value ?? null,
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await gsStore.update(editingId.value, payload)
      } else {
        await gsStore.create(payload)
      }

      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save gold source.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this gold source?')
    if (!ok) return

    try {
      await gsStore.delete(id)
      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete.')
    }
  }
</script>

<style scoped>
  .gs-form {
    background: #ffffff;
    border: 1px solid #e7eaf5;
    border-radius: 16px;
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .gs-form__header {
    display: grid;
    gap: 2px;
  }

  .gs-form__title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
  }

  .gs-form__hint {
    font-size: 12px;
    color: #64748b;
  }

  .gs-alert {
    display: flex;
    gap: 10px;
    align-items: center;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 13px;
  }

  .gs-alert--error {
    border: 1px solid #fecaca;
    background: #fff1f2;
    color: #991b1b;
  }

  .gs-alert__icon {
    font-size: 16px;
  }

  .gs-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .gs-field--full {
    grid-column: 1 / -1;
  }

  .gs-label {
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    display: block;
    margin-bottom: 6px;
  }

  .gs-input {
    width: 100%;
    padding: 11px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
  }

  .gs-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
  }

  .gs-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 4px;
  }

  .gs-btn {
    border: none;
    cursor: pointer;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 700;
    font-size: 13px;
  }

  .gs-btn--ghost {
    background: #f1f5f9;
    color: #0f172a;
  }

  .gs-btn--ghost:hover {
    background: #e2e8f0;
  }

  .gs-btn--primary {
    background: #111827;
    color: #ffffff;
  }

  .gs-btn--primary:hover {
    background: #0b1220;
  }

  .gs-search {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #e7eaf5;
    border-radius: 14px;
    background: #ffffff;
    max-width: 520px;
  }

  .gs-search__icon {
    opacity: 0.7;
  }

  .gs-search__input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 14px;
  }

  .gs-row-actions {
    display: flex;
    gap: 8px;
  }

  .gs-mini {
    border: 1px solid #cbd5e1;
    background: #ffffff;
    border-radius: 10px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .gs-mini:hover {
    background: #f8fafc;
  }

  .gs-mini--danger {
    border-color: #fecaca;
    color: #b91c1c;
    background: #fff1f2;
  }

  .gs-mini--danger:hover {
    background: #ffe4e6;
  }

  .gs-hint {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
  }
  .gs-hint--error {
    color: #b91c1c;
  }

  @media (max-width: 720px) {
    .gs-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
