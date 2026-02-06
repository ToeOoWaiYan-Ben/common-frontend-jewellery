<template>
  <TablePage
    title="Product Gold"
    :total="total"
    :filteredCount="filteredCount"
    :items="paginated"
    :pageSize="pageSize"
    :currentPage="currentPage"
    :isLoading="isLoading"
    :errorMessage="errorMessage"
    :showForm="showForm"
    :primaryButtonLabel="showForm ? 'Close Form' : 'Add Product Gold'"
    idKey="id"
    :editingId="editingId"
    @click-new="onClickNew"
    @change-page="goToPage"
  >
    <!-- FORM -->
    <template #form>
      <form class="pgx" @submit.prevent="handleSubmit">
        <h3 class="pgx__title">{{ isEditing ? 'Edit Product Gold' : 'New Product Gold' }}</h3>

        <div v-if="formError" class="pgx__alert">
          <span class="pgx__alertIcon">⚠</span>
          <span>{{ formError }}</span>
        </div>

        <div class="pgx__grid">
          <!-- Product (searchable select) -->
          <div class="pgx__field">
            <label class="pgx__label">Product *</label>

            <div class="pgx__combo" @click.stop>
              <button class="pgx__comboBtn" type="button" @click="toggleProductDd">
                <span class="pgx__comboText">
                  {{ selectedProductLabel || 'Select product' }}
                </span>
                <span class="pgx__comboIcon">▾</span>
              </button>

              <div v-if="openProductDd" class="pgx__dd">
                <div class="pgx__ddSearch">
                  <span class="pgx__ddSearchIcon">🔍</span>
                  <input
                    v-model="productQuery"
                    class="pgx__ddSearchInput"
                    type="text"
                    placeholder="Search product name..."
                  />
                </div>

                <div class="pgx__ddList">
                  <button
                    v-for="p in filteredProducts"
                    :key="p.id"
                    class="pgx__ddItem"
                    type="button"
                    @click="selectProduct(p)"
                  >
                    <div class="pgx__ddMain">{{ p.name }}</div>
                    <div class="pgx__ddSub">#{{ p.id }} • {{ p.code || '-' }}</div>
                  </button>

                  <div v-if="filteredProducts.length === 0" class="pgx__ddEmpty">
                    No products found
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Gold Source (searchable select) -->
          <div class="pgx__field">
            <label class="pgx__label">Gold Source *</label>

            <div class="pgx__combo" @click.stop>
              <button class="pgx__comboBtn" type="button" @click="toggleGoldSourceDd">
                <span class="pgx__comboText">
                  {{ selectedGoldSourceLabel || 'Select gold source' }}
                </span>
                <span class="pgx__comboIcon">▾</span>
              </button>

              <div v-if="openGoldSourceDd" class="pgx__dd">
                <div class="pgx__ddSearch">
                  <span class="pgx__ddSearchIcon">🔍</span>
                  <input
                    v-model="goldSourceQuery"
                    class="pgx__ddSearchInput"
                    type="text"
                    placeholder="Search gold source..."
                  />
                </div>

                <div class="pgx__ddList">
                  <button
                    v-for="g in filteredGoldSources"
                    :key="g.id"
                    class="pgx__ddItem"
                    type="button"
                    @click="selectGoldSource(g)"
                  >
                    <div class="pgx__ddMain">{{ g.name }}</div>
                    <div class="pgx__ddSub">
                      #{{ g.id }} • {{ g.goldPurity || '-' }} • {{ g.sourceCountry || '-' }}
                    </div>
                  </button>

                  <div v-if="filteredGoldSources.length === 0" class="pgx__ddEmpty">
                    No gold sources found
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Craft (searchable select) -->
          <div class="pgx__field">
            <label class="pgx__label">Craft *</label>

            <div class="pgx__combo" @click.stop>
              <button class="pgx__comboBtn" type="button" @click="toggleCraftDd">
                <span class="pgx__comboText">
                  {{ selectedCraftLabel || 'Select craft' }}
                </span>
                <span class="pgx__comboIcon">▾</span>
              </button>

              <div v-if="openCraftDd" class="pgx__dd">
                <div class="pgx__ddSearch">
                  <span class="pgx__ddSearchIcon">🔍</span>
                  <input
                    v-model="craftQuery"
                    class="pgx__ddSearchInput"
                    type="text"
                    placeholder="Search craft shop..."
                  />
                </div>

                <div class="pgx__ddList">
                  <button
                    v-for="c in filteredCrafts"
                    :key="c.id"
                    class="pgx__ddItem"
                    type="button"
                    @click="selectCraft(c)"
                  >
                    <div class="pgx__ddMain">{{ c.shopName }}</div>
                    <div class="pgx__ddSub">#{{ c.id }} • {{ c.phone || '-' }}</div>
                  </button>

                  <div v-if="filteredCrafts.length === 0" class="pgx__ddEmpty">No crafts found</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weight -->
          <div class="pgx__field">
            <label class="pgx__label">Weight *</label>
            <input
              v-model.number="formWeight"
              class="pgx__input"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 5.20"
            />
          </div>

          <!-- Purity -->
          <div class="pgx__field">
            <label class="pgx__label">Purity *</label>
            <input
              v-model.number="formPurity"
              class="pgx__input"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 99.99"
            />
          </div>
        </div>

        <div class="pgx__actions">
          <button
            class="pgx__btn pgx__btn--ghost"
            type="button"
            @click="resetForm"
            :disabled="isSubmitting"
          >
            Reset
          </button>

          <button
            v-if="isEditing"
            class="pgx__btn pgx__btn--ghost"
            type="button"
            @click="closeEdit"
            :disabled="isSubmitting"
          >
            Close
          </button>

          <button class="pgx__btn pgx__btn--primary" type="submit" :disabled="isSubmitting">
            {{
              isSubmitting ? (isEditing ? 'Updating…' : 'Saving…') : isEditing ? 'Update' : 'Save'
            }}
          </button>
        </div>
      </form>
    </template>

    <!-- SEARCH -->
    <template #search>
      <div class="pgxSearch">
        <span class="pgxSearch__icon">🔍</span>
        <input
          v-model="searchTerm"
          class="pgxSearch__input"
          type="text"
          placeholder="Search by product name, gold source, craft..."
        />
      </div>
    </template>

    <!-- COLUMNS -->
    <template #columns>
      <th style="width: 60px">#</th>
      <th>Product</th>
      <th>Gold Source</th>
      <th>Craft</th>
      <th>Weight</th>
      <th>Purity</th>
      <th style="width: 190px">Actions</th>
    </template>

    <!-- ROWS -->
    <template #rows="{ item }">
      <td>{{ item.id }}</td>
      <td>{{ item.productName }}</td>
      <td>{{ item.goldSourceName }}</td>
      <td>{{ item.craftShopName }}</td>
      <td>{{ item.weight }}</td>
      <td>{{ item.goldPurity }}</td>
      <td>
        <div style="display: flex; gap: 0.25rem">
          <button class="pgxRowBtn" type="button" @click="onClickEdit(item)">Edit</button>
          <button class="pgxRowBtn pgxRowBtn--danger" type="button" @click="onClickDelete(item.id)">
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
  import { useProductGoldStore } from '../stores/useProductGoldStore'
  import { http } from '../services/http'
  import type { ProductGoldDto } from '../dtos/ProductGoldDto'

  // ✅ lookup types
  type ProductMini = { id: number; name: string; code?: string | null }
  type GoldSourceMini = {
    id: number
    name: string
    goldPurity?: number | null
    sourceCountry?: string | null
  }
  type CraftMini = { id: number; shopName: string; phone?: string | null }

  const store = useProductGoldStore()
  const { items, loading, error } = storeToRefs(store)

  // ✅ lookups
  const products = ref<ProductMini[]>([])
  const goldSources = ref<GoldSourceMini[]>([])
  const crafts = ref<CraftMini[]>([])

  // ✅ dropdown open state
  const openProductDd = ref(false)
  const openGoldSourceDd = ref(false)
  const openCraftDd = ref(false)

  // ✅ dropdown search queries
  const productQuery = ref('')
  const goldSourceQuery = ref('')
  const craftQuery = ref('')

  // ✅ selected display labels
  const selectedProductLabel = ref('')
  const selectedGoldSourceLabel = ref('')
  const selectedCraftLabel = ref('')

  const searchTerm = ref('')

  onMounted(async () => {
    store.loadAll()

    // ✅ load relation lists
    // change URLs if your backend uses different path
    const p = await http<ProductMini[]>('/products')
    const g = await http<GoldSourceMini[]>('/gold-source')
    const c = await http<CraftMini[]>('/crafts')

    products.value = p ?? []
    goldSources.value = g ?? []
    crafts.value = c ?? []

    // ✅ click outside closes dropdown
    window.addEventListener('click', closeAllDropdowns)
  })

  const closeAllDropdowns = () => {
    openProductDd.value = false
    openGoldSourceDd.value = false
    openCraftDd.value = false
  }

  const isLoading = computed(() => loading.value)
  const errorMessage = computed(() => error.value)

  const filtered = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return items.value

    return items.value.filter(
      (x) =>
        (x.productName ?? '').toLowerCase().includes(term) ||
        (x.goldSourceName ?? '').toLowerCase().includes(term) ||
        (x.craftShopName ?? '').toLowerCase().includes(term)
    )
  })

  const total = computed(() => items.value.length)
  const filteredCount = computed(() => filtered.value.length)

  // pagination
  const pageSize = ref(20)
  const currentPage = ref(1)

  watch(filtered, () => {
    currentPage.value = 1
  })

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filtered.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  // form
  const showForm = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)
  const isSubmitting = ref(false)
  const formError = ref<string | null>(null)

  // ✅ id values (relations)
  const formProductId = ref(0)
  const formGoldSourceId = ref(0)
  const formCraftId = ref(0)

  // values
  const formWeight = ref(0)
  const formPurity = ref(0)

  // ✅ filtered dropdown lists
  const filteredProducts = computed(() => {
    const term = productQuery.value.trim().toLowerCase()
    if (!term) return products.value
    return products.value.filter(
      (p) => (p.name ?? '').toLowerCase().includes(term) || String(p.id).includes(term)
    )
  })

  const filteredGoldSources = computed(() => {
    const term = goldSourceQuery.value.trim().toLowerCase()
    if (!term) return goldSources.value
    return goldSources.value.filter(
      (g) => (g.name ?? '').toLowerCase().includes(term) || String(g.id).includes(term)
    )
  })

  const filteredCrafts = computed(() => {
    const term = craftQuery.value.trim().toLowerCase()
    if (!term) return crafts.value
    return crafts.value.filter(
      (c) => (c.shopName ?? '').toLowerCase().includes(term) || String(c.id).includes(term)
    )
  })

  // ✅ toggle dropdowns
  const toggleProductDd = () => {
    openGoldSourceDd.value = false
    openCraftDd.value = false
    openProductDd.value = !openProductDd.value
    if (openProductDd.value) productQuery.value = ''
  }

  const toggleGoldSourceDd = () => {
    openProductDd.value = false
    openCraftDd.value = false
    openGoldSourceDd.value = !openGoldSourceDd.value
    if (openGoldSourceDd.value) goldSourceQuery.value = ''
  }

  const toggleCraftDd = () => {
    openProductDd.value = false
    openGoldSourceDd.value = false
    openCraftDd.value = !openCraftDd.value
    if (openCraftDd.value) craftQuery.value = ''
  }

  // ✅ select item from dropdown
  const selectProduct = (p: ProductMini) => {
    formProductId.value = p.id
    selectedProductLabel.value = p.name
    openProductDd.value = false
  }

  const selectGoldSource = (g: GoldSourceMini) => {
    formGoldSourceId.value = g.id
    selectedGoldSourceLabel.value = g.name
    openGoldSourceDd.value = false
  }

  const selectCraft = (c: CraftMini) => {
    formCraftId.value = c.id
    selectedCraftLabel.value = c.shopName
    openCraftDd.value = false
  }

  const resetForm = () => {
    formProductId.value = 0
    formGoldSourceId.value = 0
    formCraftId.value = 0
    formWeight.value = 0
    formPurity.value = 0

    selectedProductLabel.value = ''
    selectedGoldSourceLabel.value = ''
    selectedCraftLabel.value = ''

    formError.value = null
    isEditing.value = false
    editingId.value = null

    closeAllDropdowns()
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

  const onClickEdit = (item: ProductGoldDto) => {
    showForm.value = true
    isEditing.value = true
    editingId.value = item.id

    formProductId.value = item.productId
    formGoldSourceId.value = item.goldSourceId
    formCraftId.value = item.craftId
    formWeight.value = item.weight
    formPurity.value = item.goldPurity

    // ✅ show labels from dto (backend already sends names)
    selectedProductLabel.value = item.productName
    selectedGoldSourceLabel.value = item.goldSourceName
    selectedCraftLabel.value = item.craftShopName

    formError.value = null
    closeAllDropdowns()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeEdit = () => {
    resetForm()
    showForm.value = false
  }

  const handleSubmit = async () => {
    formError.value = null

    if (!formProductId.value || !formGoldSourceId.value || !formCraftId.value) {
      formError.value = 'Please select Product, Gold Source, and Craft.'
      return
    }

    if (formWeight.value <= 0 || formPurity.value <= 0) {
      formError.value = 'Weight and Purity must be greater than 0.'
      return
    }

    const payload = {
      productId: Number(formProductId.value),
      goldSourceId: Number(formGoldSourceId.value),
      craftId: Number(formCraftId.value),
      weight: Number(formWeight.value),
      goldPurity: Number(formPurity.value),
    }

    isSubmitting.value = true
    try {
      if (isEditing.value && editingId.value != null) {
        await store.update(editingId.value, payload as any)
      } else {
        await store.create(payload as any)
      }
      resetForm()
      showForm.value = false
    } catch (e: any) {
      formError.value = e?.message ?? 'Failed to save product gold.'
    } finally {
      isSubmitting.value = false
    }
  }

  const onClickDelete = async (id: number) => {
    const ok = window.confirm('Are you sure you want to delete this product gold?')
    if (!ok) return

    try {
      await store.delete(id)
      if (isEditing.value && editingId.value === id) {
        resetForm()
        showForm.value = false
      }
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete product gold.')
    }
  }
</script>

<style scoped>
  .pgx {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px;
  }

  .pgx__title {
    margin: 0 0 12px;
    font-weight: 900;
    font-size: 16px;
    color: #111827;
  }

  .pgx__alert {
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

  .pgx__alertIcon {
    font-size: 16px;
  }

  .pgx__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }

  .pgx__field {
    display: grid;
    gap: 6px;
  }

  .pgx__label {
    font-size: 13px;
    font-weight: 900;
    color: #374151;
  }

  .pgx__input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
  }

  .pgx__input:focus {
    border-color: #2563eb;
  }

  /* ✅ searchable select (combo) */
  .pgx__combo {
    position: relative;
  }

  .pgx__comboBtn {
    width: 100%;
    border: 1px solid #d1d5db;
    background: #ffffff;
    border-radius: 12px;
    padding: 10px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pgx__comboBtn:focus {
    outline: none;
    border-color: #2563eb;
  }

  .pgx__comboText {
    font-size: 14px;
    color: #111827;
    font-weight: 700;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .pgx__comboIcon {
    opacity: 0.7;
    font-size: 12px;
  }

  .pgx__dd {
    position: absolute;
    z-index: 50;
    left: 0;
    right: 0;
    margin-top: 8px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 18px 45px rgba(17, 24, 39, 0.12);
    overflow: hidden;
  }

  .pgx__ddSearch {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid #eef2f7;
    background: #fafafa;
  }

  .pgx__ddSearchIcon {
    opacity: 0.6;
  }

  .pgx__ddSearchInput {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    padding: 8px 10px;
    outline: none;
    font-size: 14px;
    background: #ffffff;
  }

  .pgx__ddSearchInput:focus {
    border-color: #2563eb;
  }

  .pgx__ddList {
    max-height: 240px;
    overflow: auto;
    padding: 6px;
  }

  .pgx__ddItem {
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 10px 10px;
    border-radius: 12px;
  }

  .pgx__ddItem:hover {
    background: #eef2ff;
  }

  .pgx__ddMain {
    font-weight: 900;
    color: #111827;
    font-size: 14px;
  }

  .pgx__ddSub {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }

  .pgx__ddEmpty {
    padding: 14px 10px;
    color: #6b7280;
    font-size: 13px;
  }

  .pgx__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
  }

  .pgx__btn {
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 900;
    cursor: pointer;
    font-size: 14px;
  }

  .pgx__btn--ghost {
    background: #f3f4f6;
    color: #111827;
  }

  .pgx__btn--primary {
    background: #2563eb;
    color: #ffffff;
  }

  /* search bar */
  .pgxSearch {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 999px;
    padding: 10px 12px;
  }

  .pgxSearch__icon {
    opacity: 0.7;
  }

  .pgxSearch__input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 14px;
  }

  /* row buttons */
  .pgxRowBtn {
    border: none;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    background: #f3f4f6;
    color: #111827;
  }

  .pgxRowBtn--danger {
    background: #fee2e2;
    color: #991b1b;
  }

  @media (max-width: 900px) {
    .pgx__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
