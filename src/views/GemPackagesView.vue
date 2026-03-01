<template>
  <section class="gp-page">
    <!-- Header -->
    <div class="gp-header">
      <div>
        <h2 class="gp-title">Gems Packages</h2>
        <p class="gp-subtitle">See list first. Click “Add package” to open the form.</p>
      </div>

      <div class="gp-header-actions">
        <button
          class="gp-btn gp-btn--primary"
          type="button"
          @click="openCreate"
          :disabled="store.loading"
        >
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
            <button class="gp-mini" type="button" @click="openEdit(row)">Edit</button>
            <button class="gp-mini gp-mini--danger" type="button" @click="onDelete(row)">
              Delete
            </button>
          </div>
        </template>
      </AdminTable>
    </div>

    <!-- FORM + PREVIEW -->
    <div v-if="showForm" class="gp-grid gp-grid--below">
      <!-- LEFT: FORM -->
      <div class="gp-card">
        <div class="gp-card-head">
          <div>
            <h3 class="gp-card-title">{{ isEdit ? 'Edit package' : 'Add package' }}</h3>
            <p class="gp-card-caption">
              {{ isEdit ? `Editing #${editId}` : 'Create a new package' }}
            </p>
          </div>

          <button class="gp-btn" type="button" @click="closeForm" :disabled="store.loading">
            ✕ Close
          </button>
        </div>

        <div v-if="formError" class="gp-alert gp-alert--error" style="margin-bottom: 12px">
          <span class="gp-alert-icon">⚠</span>
          <span>{{ formError }}</span>
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
            <label class="gp-label">Package No. *</label>
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

          <!-- Unit Weight (gemsSize) -->
          <div class="gp-field">
            <label class="gp-label">Unit Weight (Carat) *</label>
            <input
              :value="form.gemsSize ?? ''"
              class="gp-input"
              type="number"
              step="0.0001"
              placeholder="e.g. 0.02"
              @input="form.gemsSize = toNumOrNull(($event.target as HTMLInputElement).value)"
            />
            <small v-if="fieldErrors.gemsSize" class="gp-error">{{ fieldErrors.gemsSize }}</small>
          </div>

          <!-- Quantity -->
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

          <!-- Package Weight (AUTO) -->
          <div class="gp-field">
            <label class="gp-label">Package Weight (Carat)</label>
            <input
              :value="packageWeightDisplay"
              class="gp-input"
              type="text"
              readonly
              placeholder="auto"
            />
          </div>

          <!-- Price block -->
          <div class="gp-field gp-field--full">
            <div class="ae-block">
              <div class="ae-left">
                <div class="ae-row">
                  <label class="ae-label">Unit Price *</label>
                  <input
                    :value="form.unitPrice ?? ''"
                    class="ae-input"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.20"
                    @input="form.unitPrice = toNumOrNull(($event.target as HTMLInputElement).value)"
                  />
                </div>
                <small v-if="fieldErrors.unitPrice" class="gp-error">{{
                  fieldErrors.unitPrice
                }}</small>

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
                  <small v-if="fieldErrors.totalPrice" class="gp-error">{{
                    fieldErrors.totalPrice
                  }}</small>
                </div>

                <div class="ae-row">
                  <label class="ae-label">Estimated Total</label>
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
          <div class="gp-field">
            <label class="gp-label">Gem Type *</label>
            <select v-model="form.gemTypeId" class="gp-input gp-select">
              <option :value="null">Select gem type</option>
              <option v-for="t in gemTypesStore.items" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
            <small v-if="fieldErrors.gemTypeId" class="gp-error">{{ fieldErrors.gemTypeId }}</small>
          </div>

          <!-- Buy Date -->
          <div class="gp-field">
            <label class="gp-label">Buy Date *</label>
            <input v-model="form.buyDate" class="gp-input" type="date" />
            <small v-if="fieldErrors.buyDate" class="gp-error">{{ fieldErrors.buyDate }}</small>
          </div>

          <!-- Color -->
          <div class="gp-field">
            <label class="gp-label">Color *</label>
            <input v-model.trim="form.color" class="gp-input" placeholder="e.g. D" />
            <small v-if="fieldErrors.color" class="gp-error">{{ fieldErrors.color }}</small>
          </div>

          <!-- Cutting -->
          <div class="gp-field">
            <label class="gp-label">Cutting *</label>
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
            <small v-if="fieldErrors.cutting" class="gp-error">{{ fieldErrors.cutting }}</small>
          </div>

          <!-- Seller (simple dropdown search like yours) -->
          <div class="gp-field gp-field--full" style="position: relative">
            <label class="gp-label">Seller *</label>

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

            <small v-if="fieldErrors.sellerId" class="gp-error">{{ fieldErrors.sellerId }}</small>
          </div>

          <!-- Certificates -->
          <div class="gp-field gp-field--full">
            <label class="gp-label">Certificate Title (optional)</label>
            <input v-model.trim="certTitle" class="gp-input" placeholder="e.g. GIA Report" />
          </div>

          <div class="gp-field gp-field--full">
            <label class="gp-label">Certificate Images</label>
            <input type="file" multiple accept="image/*" @change="onCertFilesSelected" />
            <div class="gp-muted" style="margin-top: 8px">
              Selected: {{ certFiles.length }} file(s)
            </div>
          </div>

          <!-- Existing certificate list -->
          <div class="gp-field gp-field--full" v-if="isEdit">
            <div v-if="certList.length === 0" class="gp-muted">No certificates yet.</div>

            <div v-else class="gp-cert-grid">
              <div v-for="c in certList" :key="c.id" class="gp-cert-card">
                <img :src="c.imageUrl" class="gp-cert-img" />
                <div class="gp-cert-meta">
                  <div class="gp-strong">{{ c.title || 'Certificate' }}</div>
                  <button
                    class="gp-mini gp-mini--danger"
                    type="button"
                    @click="deleteCertificate(c.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
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

        <!-- Actions (INSIDE card) -->
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

      <!-- RIGHT: PREVIEW -->
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
              <span class="gp-strong">{{ packageWeightDisplay || '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Quantity</span>
              <span class="gp-strong">{{ form.quantity ?? '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Unit Price</span>
              <span class="gp-strong">{{
                form.unitPrice == null ? '-' : formatMoney(form.unitPrice)
              }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Actual Total</span>
              <span class="gp-strong">{{
                form.totalPrice == null ? '-' : formatMoney(form.totalPrice)
              }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Estimated Total</span>
              <span class="gp-strong">
                {{ estimatedTotalPrice == null ? '-' : formatMoney(estimatedTotalPrice) }}
              </span>
            </div>
          </div>
        </div>

        <div class="gp-side-block">
          <div class="gp-side-title">Certificates</div>
          <div class="gp-muted">
            {{
              isEdit
                ? `${certList.length} file(s)`
                : 'Create package first, then upload certificates.'
            }}
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
    certificateImages: [],
    sellerId: null,
    sellerName: null,
    gemTypeId: null,
    gemTypeName: null,
    quantity: null,
    unitPrice: null,
    totalPrice: null,
  })

  const form = reactive<Omit<GemsPackageDto, 'id'>>(blank())
  const snapshot = ref(JSON.stringify(form))

  const certTitle = ref('')
  const certFiles = ref<File[]>([])

  function onCertFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement
    certFiles.value = input.files ? Array.from(input.files) : []
  }

  const certList = computed(() => form.certificateImages ?? [])

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

  const estimatedTotalPrice = computed<number | null>(() => {
    const unit = form.unitPrice
    const qty = form.quantity
    if (unit == null || qty == null) return null
    if (unit < 0 || qty <= 0) return null
    return Number((unit * qty).toFixed(2))
  })

  const estimatedTotalPriceFormatted = computed(() =>
    estimatedTotalPrice.value == null ? '' : formatMoney(estimatedTotalPrice.value)
  )

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
    for (const k in fieldErrors) fieldErrors[k] = ''
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
    certTitle.value = ''
    certFiles.value = []
    snapshot.value = JSON.stringify(form)
    clearErrors()
  }

  async function openEdit(row: GemsPackageDto) {
    showForm.value = true
    editId.value = row.id

    const full = await store.getById(row.id)

    Object.assign(form, blank())
    Object.assign(form, {
      ...full,
      certificateImages: full.certificateImages ?? [],
    })

    sellerQuery.value = full.sellerId ? `${full.sellerId} - ${full.sellerName ?? ''}` : ''
    certFiles.value = []
    snapshot.value = JSON.stringify(form)
    clearErrors()
  }

  function resetForm() {
    Object.assign(form, blank())
    certTitle.value = ''
    certFiles.value = []
    snapshot.value = JSON.stringify(form)
    clearErrors()
  }

  function closeForm() {
    showForm.value = false
    editId.value = null
    clearErrors()
  }

  function formatMoney(v?: number | null) {
    if (v == null || Number.isNaN(v)) return '-'
    return (
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        v
      ) + ' MMKs'
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

  async function onDelete(row: GemsPackageDto) {
    if (!row?.id) return
    const ok = window.confirm(`Delete package #${row.id} (${row.name}) ?`)
    if (!ok) return

    try {
      await store.remove(row.id)
      if (editId.value === row.id) closeForm()
    } catch (e) {
      console.error(e)
    }
  }

  async function deleteCertificate(certId: number) {
    if (!isEdit.value) return
    await store.deleteCertificate(certId, editId.value!)
    const latest = await store.getById(editId.value!)
    Object.assign(form, { ...latest })
    snapshot.value = JSON.stringify(form)
  }

  async function save() {
    clearErrors()

    // ✅ always compute gemsWeight before saving
    form.gemsWeight = packageWeight.value

    // ✅ null-safe validation
    const name = (form.name ?? '').trim()
    if (!name) {
      fieldErrors.name = 'Name is required'
      return
    }
    form.name = name

    try {
      let saved: GemsPackageDto

      if (isEdit.value) {
        // ✅ prevent update with null id
        if (!editId.value) {
          formError.value = 'Missing editId. Please close and edit again.'
          return
        }
        saved = await store.update(editId.value, { ...form })
      } else {
        saved = await store.create({ ...form })
        editId.value = saved.id
      }

      // upload certificates (if selected)
      for (const file of certFiles.value) {
        const url = await store.uploadToS3(file)
        await store.addCertificate(saved.id, {
          imageUrl: url,
          title: (certTitle.value ?? '').trim() || null,
        })
      }

      certFiles.value = []
      certTitle.value = ''

      // ✅ reload latest so form shows certificateImages
      const latest = await store.getById(saved.id)
      Object.assign(form, blank())
      Object.assign(form, { ...latest, certificateImages: latest.certificateImages ?? [] })

      snapshot.value = JSON.stringify(form)
      await store.loadAll()
    } catch (e: any) {
      console.error('SAVE ERROR:', e)
      if (applyBackendErrors(e)) return
      formError.value = e?.message ?? 'Failed to save.'
    }
  }

  onMounted(async () => {
    await store.loadAll()
    await gemTypesStore.loadAll()
    await sellersStore.loadAll()
  })
</script>

<style scoped src="@/styles/admin/gems-package-page.css"></style>

<style scoped>
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
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 14px;
    background: #fff;
  }
  .gp-input,
  .ae-input,
  .gp-textarea,
  .gp-dropdown {
    border: 1px solid #cbd5e1;
  }
  .gp-select {
    height: 44px;
    padding: 10px 12px;
  }
  .ae-diff {
    color: #dc2626;
    font-weight: 600;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 10px 12px;
    border-radius: 10px;
  }
  .gp-error {
    color: #dc2626;
    font-size: 12px;
    margin-top: 4px;
    display: block;
  }

  .gp-cert-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 10px;
  }
  .gp-cert-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px;
    background: #fff;
  }
  .gp-cert-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }
  .gp-cert-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    gap: 10px;
  }
</style>
