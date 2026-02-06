<template>
  <section class="gp-page">
    <!-- Header -->
    <div class="gp-header">
      <div>
        <h2 class="gp-title">Gems Packages</h2>
        <p class="gp-subtitle">See list first. Click “Add package” to open the form.</p>
      </div>

      <div class="gp-header-actions">
        <button class="gp-btn gp-btn--primary" @click="openCreate" :disabled="store.loading">
          + Add package
        </button>
      </div>
    </div>

    <!-- TABLE LIST -->
    <div class="gp-card gp-card--table">
      <div class="gp-card-head">
        <div>
          <h3 class="gp-card-title">Package list</h3>
          <p class="gp-card-caption">{{ store.items.length }} items</p>
        </div>

        <div class="gp-search">
          <input
            v-model.trim="q"
            class="gp-input gp-input--search"
            placeholder="Search name / gem type / seller..."
          />
        </div>
      </div>

      <div v-if="store.error" class="gp-alert gp-alert--error">
        <span class="gp-alert-icon">⚠</span>
        <span>{{ store.error }}</span>
      </div>

      <AdminTable
        title=""
        :columns="columns"
        :rows="filteredRows"
        :pageSize="8"
        :editingId="editId"
      >
        <template #cell-totalPrice="{ value }">
          {{ formatMoney(value as number | null | undefined) }}
        </template>

        <template #cell-unitPrice="{ value }">
          {{ formatMoney(value as number | null | undefined) }}
        </template>

        <template #cell-actions="{ row }">
          <div class="gp-row-actions">
            <button class="gp-mini" @click="openEdit(row)">Edit</button>
            <button class="gp-mini gp-mini--danger" @click="onDelete(row)">Delete</button>
          </div>
        </template>
      </AdminTable>
    </div>

    <!-- FORM -->
    <div v-if="showForm" class="gp-grid gp-grid--below">
      <div class="gp-card">
        <div class="gp-card-head">
          <div>
            <h3 class="gp-card-title">{{ isEdit ? 'Edit package' : 'Add package' }}</h3>
            <p class="gp-card-caption">
              {{ isEdit ? `Editing #${editId}` : 'Create a new package' }}
            </p>
          </div>

          <button class="gp-btn" @click="closeForm" :disabled="store.loading">✕ Close</button>
        </div>

        <div class="gp-form">
          <!-- Name -->
          <div class="gp-field">
            <label class="gp-label">Name *</label>
            <input v-model.trim="form.name" class="gp-input" placeholder="e.g. Diamond Set A" />
            <small v-if="fieldErrors.name" class="gp-error">{{ fieldErrors.name }}</small>
          </div>

          <!-- Package No -->
          <div class="gp-field">
            <label class="gp-label">Package No.</label>
            <input
              :value="form.packageNumber ?? ''"
              class="gp-input"
              type="number"
              placeholder="e.g. 1001"
              @input="form.packageNumber = toIntOrNull(($event.target as HTMLInputElement).value)"
            />
            <small v-if="fieldErrors.packageNumber" class="gp-error">{{
              fieldErrors.packageNumber
            }}</small>
          </div>

          <!-- Unit Weight (per gem) -> gemsSize -->
          <div class="gp-field">
            <label class="gp-label">Unit Weight (Carat)</label>
            <input
              :value="form.gemsSize ?? ''"
              class="gp-input"
              type="number"
              step="0.0001"
              placeholder="e.g. 0.02"
              @input="form.gemsSize = toNumOrNull(($event.target as HTMLInputElement).value)"
            />
            <small v-if="fieldErrors.gemsSize" class="gp-error">
              {{ fieldErrors.gemsSize }}
            </small>
          </div>

          <!-- Quantity (INPUT) -->
          <div class="gp-field">
            <label class="gp-label">Quantity *</label>
            <input
              :value="form.quantity ?? ''"
              class="gp-input"
              type="number"
              placeholder="e.g. 100"
              @input="form.quantity = toIntOrNull(($event.target as HTMLInputElement).value)"
            />
            <small v-if="fieldErrors.quantity" class="gp-error">{{ fieldErrors.quantity }}</small>
          </div>

          <!-- Package Weight (Carat) (AUTO) -->
          <div class="gp-field">
            <label class="gp-label">Package Weight (Carat)</label>
            <input
              :value="packageWeightDisplay"
              class="gp-input"
              type="text"
              readonly
              placeholder="auto"
            />
            <small v-if="fieldErrors.gemsWeight" class="gp-error">
              {{ fieldErrors.gemsWeight }}
            </small>
          </div>

        

          <!-- ✅ Price block (Unit Price input + totals auto + diff message) -->
          <div class="gp-field gp-field--full">
            <div class="ae-block">
              <div class="ae-left">
                <div class="ae-row">
                  <label class="ae-label">Unit Price</label>
                  <input
                    :value="form.unitPrice ?? ''"
                    class="ae-input"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.20"
                    @input="form.unitPrice = toNumOrNull(($event.target as HTMLInputElement).value)"
                  />
                  <small v-if="fieldErrors.unitPrice" class="gp-error">
                    {{ fieldErrors.unitPrice }}
                  </small>
                </div>

                <div class="gp-field">
                  <label class="gp-label">Actual Total Price *</label>
                  <input
                    :value="form.totalPrice ?? ''"
                    class="gp-input"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 120"
                    @input="
                      form.totalPrice = toNumOrNull(($event.target as HTMLInputElement).value)
                    "
                  />
                  <small v-if="fieldErrors.totalPrice" class="gp-error">
                    {{ fieldErrors.totalPrice }}
                  </small>
                </div>

                <div class="ae-row">
                  <label class="ae-label">Estimated Total Price</label>
                  <input
                    :value="estimatedTotalPriceFormatted"
                    class="ae-input"
                    type="text"
                    readonly
                    placeholder="auto"
                  />
                </div>
              </div>

              <div class="ae-right ae-diff" v-if="showPriceDiff">
                Actual and Estimated Price have difference
              </div>
            </div>
          </div>

          <!-- Gem Type -->
          <!-- Gem Type -->
          <div class="gp-field">
            <label class="gp-label">Gem Type</label>

            <select v-model="form.gemTypeId" class="gp-input gp-select">
              <option :value="null">Select gem type</option>
              <option v-for="t in gemTypesStore.items" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>

            <small
              v-if="gemTypesStore.items.length === 0"
              class="gp-muted"
              style="display: block; margin-top: 6px"
            >
              No gem types found. Please register gem types first.
            </small>
            <small v-if="fieldErrors.gemTypeId" class="gp-error">
              {{ fieldErrors.gemTypeId }}
            </small>
          </div>

          <!-- Buy Date -->
          <div class="gp-field">
            <label class="gp-label">Buy Date</label>
            <input v-model="form.buyDate" class="gp-input" type="date" />
            <small v-if="fieldErrors.buyDate" class="gp-error">
              {{ fieldErrors.buyDate }}
            </small>
          </div>

          <!-- Color -->
          <div class="gp-field">
            <label class="gp-label">Color</label>
            <input v-model.trim="form.color" class="gp-input" placeholder="e.g. D" />
            <small v-if="fieldErrors.color" class="gp-error">
              {{ fieldErrors.color }}
            </small>
          </div>

          <!-- Cutting -->
          <div class="gp-field">
            <label class="gp-label">Cutting</label>

            <select v-model="form.cutting" class="gp-input gp-select">
              <option value="">Select cutting</option>
              <option value="Round">Round</option>
              <option value="Princess">Princess</option>
              <option value="Emerald">Emerald</option>
              <option value="Oval">Oval</option>
              <option value="Cushion">Cushion</option>
              <option value="Pear">Pear</option>
              <option value="Marquise">Marquise</option>
              <option value="Asscher">Asscher</option>
              <option value="Radiant">Radiant</option>
              <option value="Heart">Heart</option>
            </select>
            <small v-if="fieldErrors.cutting" class="gp-error">
              {{ fieldErrors.cutting }}
            </small>
          </div>

          <!-- Certificate -->
          <div class="gp-field">
            <label class="gp-label">Certificate ID</label>
            <input
              :value="form.certificateId ?? ''"
              class="gp-input"
              type="number"
              placeholder="e.g. 10"
              @input="form.certificateId = toIntOrNull(($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Seller searchable -->
          <div class="gp-field">
            <label class="gp-label">Seller</label>

            <input
              v-model.trim="sellerQuery"
              class="gp-input"
              placeholder="Search seller: type id or name..."
              @focus="showSellerDropdown = true"
              @blur="setTimeout(() => (showSellerDropdown = false), 150)"
            />

            <div v-if="showSellerDropdown" class="gp-dropdown">
              <button
                v-for="s in filteredSellers"
                :key="s.id"
                type="button"
                class="gp-dropdown-item"
                @click="selectSeller(s.id, s.name)"
              >
                {{ s.id }} - {{ s.name }}
              </button>

              <div v-if="filteredSellers.length === 0" class="gp-dropdown-empty">No matches</div>
            </div>

            <small class="gp-muted" style="display: block; margin-top: 6px">
              Selected:
              <b>{{ form.sellerId ? `${form.sellerId} - ${form.sellerName ?? ''}` : '-' }}</b>
            </small>
            <small v-if="fieldErrors.sellerId" class="gp-error">
              {{ fieldErrors.sellerId }}
            </small>
          </div>

          <!-- Description -->
          <div class="gp-field gp-field--full">
            <label class="gp-label">Description</label>
            <textarea
              v-model.trim="form.description"
              class="gp-textarea"
              rows="3"
              placeholder="Short note..."
            />
          </div>
        </div>

        <div class="gp-actions">
          <button class="gp-btn" type="button" @click="resetForm" :disabled="store.loading">
            Reset
          </button>

          <button
            class="gp-btn gp-btn--primary"
            type="button"
            @click="save"
            :disabled="store.loading || !form.name.trim()"
          >
            {{ store.loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create package' }}
          </button>
        </div>
      </div>

      <!-- Side preview -->
      <div class="gp-card gp-card--side">
        <div class="gp-side-top">
          <div class="gp-side-sku">
            <span class="gp-side-label">Package</span>
            <span class="gp-side-value">{{ isEdit ? `#${editId}` : 'not set' }}</span>
          </div>

          <div class="gp-status" :class="dirty ? 'gp-status--warn' : 'gp-status--ok'">
            {{ dirty ? 'Unsaved' : 'Up to date' }}
          </div>
        </div>

        <div class="gp-side-block">
          <div class="gp-side-title">Quick preview</div>

          <div class="gp-preview">
            <div class="gp-preview-row">
              <span class="gp-muted">Name</span>
              <span class="gp-strong">{{ form.name || '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Gem</span>
              <span class="gp-strong">{{ selectedGemTypeName }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Unit Weight</span>
              <span class="gp-strong">{{ form.gemsSize ?? '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Package Weight</span>
              <span class="gp-strong">{{ packageWeightDisplay ?? '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Actual Qty</span>
              <span class="gp-strong">{{ form.quantity ?? '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Quantity</span>
              <span class="gp-strong">{{ form.quantity ?? '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Package Weight</span>
              <span class="gp-strong">{{ packageWeightDisplay || '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Unit Price</span>
              <span class="gp-strong">{{
                form.unitPrice == null ? '-' : formatMoney(form.unitPrice)
              }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Actual Total</span>
              <span class="gp-strong">{{ actualTotalPriceDisplay || '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Estimated Total</span>
              <span class="gp-strong">{{ estimatedTotalPrice || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import AdminTable, { type TableColumn } from '../components/admin/AdminTable.vue'
  import { useGemsPackagesStore } from '../stores/useGemsPackagesStore'
  import type { GemsPackageDto } from '../dtos/GemsPackageDto'
  import { useGemTypesStore } from '../stores/useGemTypesStore'
  import { useSellersStore } from '../stores/useSellersStore'

  const store = useGemsPackagesStore()
  const gemTypesStore = useGemTypesStore()
  const sellersStore = useSellersStore()

  const q = ref('')
  const showForm = ref(false)
  const editId = ref<number | null>(null)

  // ✅ Your backend dto now includes: quantity, unitPrice, totalPrice
  const blank = (): Omit<GemsPackageDto, 'id'> => ({
    name: '',
    packageNumber: null,
    gemsSize: null,
    gemsWeight: null,
    color: null,
    cutting: null,
    description: null,
    originalPrice: null,
    buyDate: null,

    certificateId: null,
    sellerId: null,
    sellerName: null,

    gemTypeId: null,
    gemTypeName: null,

    // ✅ new backend fields
    quantity: null,
    unitPrice: null,
    totalPrice: null,
  })

  const form = reactive<Omit<GemsPackageDto, 'id'>>(blank())
  const snapshot = ref(JSON.stringify(form))

  const formError = ref<string | null>(null)
  const fieldErrors = reactive<Partial<Record<string, string>>>({})

  const isEdit = computed(() => editId.value != null)
  const dirty = computed(() => JSON.stringify(form) !== snapshot.value)

  const columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '70px' },
    { key: 'name', label: 'Name', width: '220px' },
    { key: 'gemTypeName', label: 'Gem Type', width: '140px' },
    { key: 'packageNumber', label: 'Package No.' },
    { key: 'gemsSize', label: 'Unit Wt' },
    { key: 'gemsWeight', label: 'Pkg Wt' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unitPrice', label: 'Unit Price', align: 'right' },
    { key: 'totalPrice', label: 'Total', align: 'right' },
    { key: 'buyDate', label: 'Buy Date', width: '120px' },
    { key: 'sellerName', label: 'Seller', width: '160px' },
    { key: 'actions', label: 'Actions', width: '160px', align: 'center' },
  ]

  const filteredRows = computed(() => {
    const text = q.value.toLowerCase()
    if (!text) return store.items
    return store.items.filter((x) => {
      const a = (x.name ?? '').toLowerCase()
      const b = (x.gemTypeName ?? '').toLowerCase()
      const c = (x.sellerName ?? '').toLowerCase()
      return a.includes(text) || b.includes(text) || c.includes(text)
    })
  })

  const selectedGemTypeName = computed(() => {
    if (!form.gemTypeId) return '-'
    return gemTypesStore.items.find((x) => x.id === form.gemTypeId)?.name ?? '-'
  })

  const packageWeight = computed<number | null>(() => {
    const uw = form.gemsSize
    const qty = form.quantity
    if (uw == null || qty == null) return null
    if (uw <= 0 || qty <= 0) return null
    return Number((uw * qty).toFixed(4))
  })

  const packageWeightDisplay = computed(() =>
    packageWeight.value == null ? '' : String(packageWeight.value)
  )

  // ✅ INPUT (Actual Total Price) — user types this (NOT derived)
  const actualTotalPriceDisplay = computed(() =>
    form.totalPrice == null ? '' : String(form.totalPrice)
  )

  // ✅ DERIVED (Estimated Total Price) = unitPrice * ACTUAL quantity
  const estimatedTotalPrice = computed<number | null>(() => {
    const unit = form.unitPrice
    const qty = form.quantity // ✅ actual quantity
    if (unit == null || qty == null) return null
    if (unit < 0 || qty <= 0) return null
    return Number((unit * qty).toFixed(2))
  })

  // ✅ FORMATTED strings for UI (nice money display)
  const actualTotalPriceFormatted = computed(() =>
    form.totalPrice == null ? '' : formatMoney(form.totalPrice)
  )

  const estimatedTotalPriceFormatted = computed(() =>
    estimatedTotalPrice.value == null ? '' : formatMoney(estimatedTotalPrice.value)
  )

  // ✅ show “diff” only when both exist and actually different
  const showPriceDiff = computed(() => {
    const a = form.totalPrice
    const e = estimatedTotalPrice.value
    if (a == null || e == null) return false
    return Math.abs(a - e) > 0.01
  })

  /* SELLER SEARCH */
  const sellerQuery = ref('')
  const showSellerDropdown = ref(false)

  const filteredSellers = computed(() => {
    const qq = sellerQuery.value.trim().toLowerCase()
    if (!qq) return sellersStore.items
    return sellersStore.items.filter((s) => `${s.id} ${s.name}`.toLowerCase().includes(qq))
  })

  function selectSeller(id: number, name: string) {
    form.sellerId = id
    form.sellerName = name
    sellerQuery.value = `${id} - ${name}`
    showSellerDropdown.value = false
  }
  function clearErrors() {
    formError.value = null
    for (const k in fieldErrors) {
      fieldErrors[k] = ''
    }
  }

  function applyBackendErrors(e: any) {
    const errors = e?.data?.errors
    if (errors && typeof errors === 'object') {
      clearErrors()
      Object.assign(fieldErrors, errors)
      return true
    }
    return false
  }
  function openCreate() {
    showForm.value = true
    editId.value = null
    Object.assign(form, blank())
    sellerQuery.value = ''
    snapshot.value = JSON.stringify(form)

    setTimeout(() => {
      document.querySelector('.gp-grid--below')?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }
  function openEdit(row: GemsPackageDto) {
    showForm.value = true
    editId.value = row.id
    Object.assign(form, { ...row })
    snapshot.value = JSON.stringify(form)
    clearErrors()
  }

  function resetForm() {
    Object.assign(form, blank())
    snapshot.value = JSON.stringify(form)
    clearErrors()
  }

  onMounted(async () => {
    await store.loadAll()
    await gemTypesStore.loadAll()
    await sellersStore.loadAll()
  })

  function formatMoney(v?: number | null) {
    if (v == null || Number.isNaN(v)) return '-'
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v) + ' MMKs'
    )
  }

  function toNumOrNull(v: string): number | null {
    const t = v.trim()
    if (!t) return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  function toIntOrNull(v: string): number | null {
    const t = v.trim()
    if (!t) return null
    const n = Number.parseInt(t, 10)
    return Number.isFinite(n) ? n : null
  }

  function closeForm() {
    showForm.value = false
    editId.value = null
  }

  async function save() {
    clearErrors()
    form.gemsWeight = packageWeight.value

    if (!form.name.trim()) {
      fieldErrors.name = 'Name is required'
      return
    }

    try {
      if (isEdit.value) {
        await store.update(editId.value!, { ...form })
      } else {
        await store.create({ ...form })
      }

      await store.loadAll()
      closeForm()
    } catch (e: any) {
      // ✅ show field errors under inputs
      if (applyBackendErrors(e)) return

      // ✅ fallback top error
      formError.value = e?.message ?? 'Failed to save.'
    }
  }

  async function onDelete(row: GemsPackageDto) {
    if (!confirm(`Delete "${row.name}"?`)) return
    await store.remove(row.id)
    await store.loadAll()
  }
</script>

<style scoped src="@/styles/admin/gems-package-page.css"></style>

<style scoped>
  /* ✅ Actual vs Estimated block style (like your screenshot) */
  .ae-block {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 18px;
    align-items: center;
  }
  .ae-left {
    display: grid;
    gap: 12px;
  }
  .ae-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 12px;
    align-items: center;
  }
  .ae-label {
    font-weight: 600;
    color: #1f2937;
  }
  .ae-input {
    width: 100%;
    border: 2px solid #111827;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 14px;
    background: #fff;
  }
  .ae-right {
    color: #111827;
    font-weight: 600;
  }
  /* ✅ unify border color + remove "bold/strong" look */
  .gp-input,
  .ae-input,
  .gp-textarea,
  .gp-dropdown {
    border: 1px solid #cbd5e1; /* same border everywhere */
  }

  /* ✅ make the AE inputs look same weight as other inputs */
  .ae-input {
    font-weight: 400; /* remove bold feeling */
    background: #fff;
    box-shadow: none;
  }

  /* ✅ Bigger selects (Gem Type + Cutting) */
  .gp-select {
    height: 44px; /* bigger */
    padding: 10px 12px;
    line-height: 1.2;
    appearance: none; /* cleaner dropdown */
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  /* ✅ prevent dropdown from being "cut" by parent containers */
  .gp-form,
  .gp-field {
    overflow: visible;
  }

  /* (optional) add a simple dropdown arrow look */
  .gp-field select.gp-select {
    background-image:
      linear-gradient(45deg, transparent 50%, #64748b 50%),
      linear-gradient(135deg, #64748b 50%, transparent 50%),
      linear-gradient(to right, transparent, transparent);
    background-position:
      calc(100% - 18px) calc(50% - 2px),
      calc(100% - 12px) calc(50% - 2px),
      calc(100% - 2.5em) 0.5em;
    background-size:
      6px 6px,
      6px 6px,
      1px 1.5em;
    background-repeat: no-repeat;
    padding-right: 36px;
  }

  /* ✅ Difference text should be RED (not black) */
  .ae-diff {
    color: #dc2626; /* red */
    font-weight: 600;
  }

  /* optional: make diff area look like warning badge */
  .ae-right.ae-diff {
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 10px 12px;
    border-radius: 10px;
  }
  .gp-input--error {
    border-color: #dc2626 !important;
  }

  .gp-error {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
    display: block;
  }
</style>
